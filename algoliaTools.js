'use strict';

/*
 * Parse Apiary markdown files into AST and produce an object per API element
 * for Algolia to index.
 *
 * services/*.md -> protagonist -> AST -> [cleanup] -> json file
 *
 * The resulting JSON file is intended for upload to an Algolia index.
 *
 */

var fs = require('fs')
  , crypto = require('crypto')
  , q = require('q')
  , protagonist = require('protagonist')
  , algolia = require('algoliasearch');

// sigh
let readfilep = q.nfbind(fs.readFile);
let writefilep = q.nfbind(fs.writeFile);

// Parse Apiary Blueprint content into AST
// Returns: promise of AST
function parseBlueprint(content) {
  return q.nfcall(protagonist.parse, content, {'type': 'ast'})
    .then(result => parseDescriptions(result.ast));
}

// Parse markdown content into sections: headings and body content
function parseDescriptions(ast) {
  // Walk raw content line by line building a list of sections indexed by heading 
  ast.sections = chunkMarkdown(ast.description);
  ast.resourceGroups.forEach((resGroup, rgidx) => {
    resGroup.sections = chunkMarkdown(resGroup.description);
  });
  return ast;
}

// Extract a human readable heading string from a Markdown heading line
function cleanHeading(heading) {
  let match = heading.match(/^\s*#+\s*(.+)\s*$/);
  if (match) {
    return match[1];
  }
  return heading;
}

// Split markdown content into heading/content pairs
function chunkMarkdown(markdown) {
  let lines = markdown.split(/\n/).map((line, lidx) => ({line: line, lineidx: lidx}));
  let headings = lines.filter(line => line.line.match(/^\s*#+/));
  return headings.map((heading, hidx) => ({
    heading: cleanHeading(heading.line),
    content: lines.slice(heading.lineidx+1, hidx < headings.length-1 ? headings[hidx+1].lineidx : lines.length)
      .map(h => h.line)
      .join('\n')
  }));
}

// Visitor pattern for Protagonist AST trees. Visitor should implement at least one of:
//  - visitSection({...}, idx)
//  - visitResourceGroup({...}, idx)
//  - visitResGroupSection({...}, resGroup, idx, rgIdx)
//  - visitResource({...}, parentResourceGroup, rgIdx, resIdx)
//  - visitAction({...}, parentResource, parentResourceGroup, actIdx, resIdx, rgIdx)
function visitAST(ast, visitor, userVal) {
  ast.sections.forEach((section, hidx) => {
    if (visitor.visitSection && !visitor.visitSection(section, hidx)) {
      return;
    }
  });

  ast.resourceGroups.forEach((resGroup, rgidx) => {
    if (visitor.visitResourceGroup && !visitor.visitResourceGroup(resGroup, rgidx, userVal)) {
      return;
    }

    resGroup.sections.forEach((rgSection, rghidx) => {
      if (visitor.visitResGroupSection && !visitor.visitResGroupSection(rgSection, resGroup, rghidx, rgidx)) {
        return;
      }
    });

    resGroup.resources.forEach((resource, ridx) => {
      if (visitor.visitResource && !visitor.visitResource(resource, resGroup, ridx, rgidx, userVal)) {
        return;
      }

      resource.actions.forEach((action, aidx) => {
        if (visitor.visitAction && !visitor.visitAction(action, resGroup, resource, aidx, ridx, rgidx, userVal)) {
          return;
        }
      });
    });
  });
}

// -------------------------------------------------------------------------------------------

// blah.ext -> blah
function stripExt(s) {
  return s.substr(0, s.lastIndexOf('.'));
}

// Convert a title to an HTML anchor
function slugify(value) {
  if (value == null) {
    return '';
  }
  return value.toLowerCase().replace(/[ \t\n\\<>"'=:\/]/g, '-').replace(/-+/g, '-').replace(/^-/, '');
}

let SECTION_RANK = 10000;
let RESGROUP_RANK = 10000;
let RESGROUP_SECTION_RANK = 1000;
let RESOURCE_RANK = 100;
let ACTION_RANK = 10;

function rank(idx, scale) {
  return (idx+1) * scale;
}

// Replicate Aglio/Olio's element ID and link generation logic.
// Produce a rank for each searchable object to enable ordering in search results.
//
// NOTE: Algolia uses each object's `rank` field to order search results.
// It sorts in ascending order to produce a top-level -> nested object ordering.
// e.g. 'recipient lists' comes before 'recipient lists - create'.
function enrichAST(ast, path, serviceIdx) {
  visitAST(ast, {
    visitSection: (section, sIdx) => {
      section.elementId = slugify(section.heading);
      section.elementLink = path + '#header-' + section.elementId;
      section.rank = rank(sIdx + serviceIdx, SECTION_RANK);
      return true;
    },
    visitResourceGroup: (resGroup, rgIdx) => {
      resGroup.elementId = slugify(resGroup.name);
      resGroup.elementLink = path + "#" + resGroup.elementId;
      resGroup.rank = rank(rgIdx + serviceIdx, RESGROUP_RANK);
      return true;
    },
    visitResGroupSection: (rgSection, rgsIdx, resGroup) => {
      rgSection.elementId = slugify(rgSection.heading);
      rgSection.elementLink = path + '#header-' + rgSection.elementId;
      rgSection.rank = resGroup.rank + rank(rgsIdx, RESGROUP_SECTION_RANK);
      return true;
    },
    visitResource: (resource, resGroup, resIdx, rgIdx, userVal) => {
      resource.elementId = slugify(resGroup.name + "-" + resource.name);
      resource.elementLink = path + "#" + resource.elementId;
      resource.rank = resGroup.rank + rank(resIdx, RESOURCE_RANK);
      return true;
    },
    visitAction: (action, resGroup, resource, actIdx) => {
      action.elementId = slugify(resGroup.name + "-" + resource.name + "-" + action.method);
      action.elementLink = path + "#" + action.elementId;
      action.rank = resource.rank + rank(actIdx, ACTION_RANK);
      return true;
    }
  });
}

// Collect a flat array of searchable objects ready for upload to Algolia
function collectSearchables(ast) {
  let searchables = [];
  visitAST(ast, {
    visitSection: section => {
      searchables.push({
        sectionName: section.heading,
        description: section.content,
        element: 'description',
        objectID: section.elementLink,
        rank: section.rank
      });
      return true;
    },
    visitResourceGroup: resGroup => {
      searchables.push({
        resGroupName: resGroup.name,
        description: resGroup.description,
        element: resGroup.element || 'resourceGroup',
        objectID: resGroup.elementLink,
        rank: resGroup.rank
      });
      return true;
    },
// Do not emit resource group sections as searchables - their content is included in the resource group descriptions.
/*
    visitResGroupSection: rgSection => {
      searchables.push({
        sectionName: rgSection.heading,
        description: rgSection.content,
        rank: rgSection.rank
      });
      return true;
    },
*/
    visitResource: (resource, resGroup) => {
      searchables.push({
        resGroupName: resGroup.name,
        resName: resource.name,
        description: resource.description,
        element: resource.element,
        objectID: resource.elementLink,
        rank: resource.rank
      });
      return true;
    },
    visitAction: (action, resource, resGroup) => {
      searchables.push({
        resGroupName: resGroup.name,
        resName: resource.name,
        actionName: action.name,
        description: action.description,
        element: 'action',
        objectID: action.elementLink,
        rank: action.rank
      });
      return true;
    }
  });
  return searchables;
}

// Hash each property key and value and store the hash on the object
// WARNING: assumes a flat non-nested object structure
function genHash(obj) {
  let hash = crypto.createHash('sha256')
    , keys = Object.keys(obj).sort();
  keys.forEach(k => {
    hash.update(k);
    hash.update(String(obj[k]));
  });
  obj.hash = hash.digest('hex');
  return obj;
}

// -------------------------------------------------------------------------------------------

module.exports = {
  createSearchContent: function(services, outputPath) {
    // Parse blueprint files, add useful fields to the resulting AST and write JSON to file
    return q.all(services.map(svc => readfilep(`services/${svc}`, {encoding:'utf8'})))
      .then(files => q.all(files.map(parseBlueprint)))
      .then(asts => {
        let searchableObjects = asts.map(function (ast, idx) {
          let path = stripExt(services[idx]);

          if (path == 'introduction') {
            path = 'index';
          }

          enrichAST(ast, path, idx+1);
          return collectSearchables(ast);
        });

        return [].concat.apply([], searchableObjects);
      })
      .then(searchables => {
        return writefilep(outputPath, JSON.stringify(searchables, null, '  '));
      });
  },

  // Copy the live index to a temporary 'updating' index (wait for the copy to complete)
  // Clear the updating index (wait for completion)
  // Batch insert the new searchable objects into the updating index (wait...)
  // Move the updating index on top of the live index (wait...)
  updateSearchIndex: function(inputPath, appID, apiKey, indexName, log) {
    let searchables = require('./' + inputPath)
      , client = algolia(appID, apiKey)
      , tmpIdxName = indexName + '-Updating'
      , tmpIdx;
    log = log || function() {};
    return q.ninvoke(client, 'copyIndex', indexName, tmpIdxName)
      .then(result => {
        log(`Copying Algolia index ${indexName} to ${tmpIdxName}...`);
        tmpIdx = client.initIndex(tmpIdxName);
        tmpIdx.waitTaskP = q.nbind(tmpIdx.waitTask, tmpIdx);
        return tmpIdx.waitTaskP(result.taskID);
      })
      .then(() => {
        log(`Clearing index ${tmpIdxName}...`);
        return q.ninvoke(tmpIdx, 'clearIndex');
      })
      .then(result => tmpIdx.waitTaskP(result.taskID))
      .then(() => {
        log(`Importing ${searchables.length} searchable objects to Algolia index ${tmpIdxName}...`);
        return q.ninvoke(tmpIdx, 'addObjects', searchables);
      })
      .then(result => tmpIdx.waitTaskP(result.taskID))
      .then(() => {
        log(`Moving Algolia index ${tmpIdxName} to ${indexName}...`);
        return q.ninvoke(client, 'moveIndex', tmpIdxName, indexName);
      })
      .then(result => tmpIdx.waitTaskP(result.taskID))
      .then(() => {
        log('done');
      });
  }
};

