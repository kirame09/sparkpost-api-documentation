/* jshint laxcomma: true, multistr: true */
var matchdep = require('matchdep')
    , assert = require('assert')
    , fs = require('fs')
    , q = require('q')
    , request = require('request')
    , services = [
        'introduction.md',
        'substitutions_reference.md',
        'inbound_domains_api.md',
        'metrics_api.md',
        'message_events_api.md',
        'recipient_list_api.md',
        'relay_webhooks_api.md',
        'sending_domains_api.md',
        'subaccounts_api.md',
        'suppression_list_api.md',
        'templates_api.md',
        'tracking_domains_api.md',
        'transmissions_api.md',
        'webhooks_api.md',
        'smtp_api.md'
    ], striptags = require('striptags')
    , Swiftype = require('swiftype');

function _md2html(obj, val, idx) {
    var name = (val.split('.'))[0];
    if (val === 'introduction.md') {
        name = 'index';
    }
    obj['aglio/'+ name +'.html'] = [ 'services/'+ val ];
    return obj;
}

function sectionName(md) {
    var name = (md.split('.'))[0];
    if (name === 'introduction') {
        name = 'index';
    }
    return name;
}

function htmlFile(md) {
    var name = sectionName(md);
    return 'aglio/'+ name +'.html';
}

function html2swiftype(html) {
  var htmlra = html.split('/');
  var file = htmlra[htmlra.length-1];
  var name = (file.split('.'))[0];
  return 'swiftype/'+ name +'.json';
}

module.exports = function(grunt) {
    // Dynamically load any preexisting grunt tasks/modules
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    var cheerio = require('cheerio');
    var swiftype // see swiftype-init
      , swiftypeApiKey = process.env.SWIFTYPE_API_KEY
      , swiftypeEngine = 'sparkpost'
      , swiftypeDoctype = 'apidoc';


    // Configure existing grunt tasks and create custom ones
    grunt.initConfig({
        aglio: {
            build: {
                files: services.reduce(_md2html, {})
            },
        },

        dom_munger: {
            main: {
                src: services.map(htmlFile),
                options: {
                    callback: function($,file) {
                        // absolutify sub-section links
                        $('nav a[href^=#]').each(
                          function(idx, elt) {
                            var obj = $(elt);
                            var filename = (file.split('/'))[1];
                            var href = filename + obj.attr('href');
                            // Rename #top anchor so auto-expansion works as expected.
                            if (href == 'substitutions_reference.html#top') {
                                href = filename + '#substitutions-reference-top';
                            }
                            obj.attr('href', href);
                          }
                        );

                        var name = (file.split('.'))[0];
                        name = (name.split('/'))[1];
                        // Fix nav name, it's Overview for some reason
                        if (name == 'substitutions_reference') {
                            $('nav div.heading a[href^="substitutions_reference.html#"]').text('Substitutions Reference');
                        }
                        // save a copy of the fixed-up nav from the current page
                        // we'll use this in `copy`, below
                        grunt.option('dom_munger.getnav.'+ name, $('nav').html());

                        // don't write out file changes, we'll do that in `copy` too
                        return false;
                    }
                }
            }
        },

        copy: {
            main: {
                src: services.map(htmlFile),
                dest: './',
                options: {
                    process: function(content, srcpath) {
                        // get the global nav we build and cache below
                        var allnav = grunt.option('copy.allnav');
                        if (allnav === undefined) {
                            // build and cache global nav if we haven't yet this run
                            allnav = '';
                            var names = services.map(sectionName);
                            for (var idx in names) {
                                var name = names[idx];
                                var html = grunt.option('dom_munger.getnav.'+ name);
                                if (html === undefined) {
                                    grunt.log.error('no nav html for ['+ name +'], run dom_munger before copy!');
                                    return null;
                                }
                                allnav = allnav + html;
                            }
                            grunt.option('copy.allnav', allnav);
                        }

                        // get a DOM for our global nav
                        $ = cheerio.load(allnav);
                        var file = (srcpath.split('/'))[1];
                        // css selector for current nav
                        var curNav = 'div.heading a[href^="'+ file +'#"]';
                        // anchor from current nav
                        var anchor = (($(curNav).attr('href')).split('#'))[1];

                        // indicate current page w/in nav
                        // FIXME: style info doesn't belong in Grunt, put this elsewhere,
                        // perhaps a per-"service" external stylesheet
                        $(curNav).attr('style', 'font-weight:bold;background-color:#fa6423;color:#fff;');
                        allnav = $.html();

                        // replace single-page nav with the global nav we built above
                        content = content.replace(/<nav[^>]*>.*?<\/nav>/, '<nav>'+ allnav +'</nav>');

                        // auto-expand nav on page load
                        var collapse = '    var nav = document.querySelectorAll(\'nav .resource-group .heading a[href$="#'+
                            anchor +'"]\');\n    toggleCollapseNav({target: nav[0]});\n';
                        content = content.replace(/(window\.onload\s*=\s*function\s*\(\)\s*\{[^}]+)\}/, '$1'+ collapse +'}');

                        return content;
                    }
                }
            }
        },

        concat: {
            options: {
                banner: 'FORMAT: X-1A' + grunt.util.linefeed +
                    'HOST: https://api.sparkpost.com/api/v1' +
                    grunt.util.linefeed + grunt.util.linefeed
            },
            prod: {
                src: services.map(function(s) { return 'services/' + s; }),
                dest: 'apiary.apib'
            }
        },

        connect: {
            apiary: {
                options: {
                    port: 4000,
                    hostname: '0.0.0.0',
                    open: true,
                    middleware: function(connect) {
                        return [
                            require('connect-livereload')(),
                            connect.static('apiary-previews'),
                            connect.directory('apiary-previews')
                        ];
                    }
                }
            }
        },

        shell: {
            test: {
                command : function(file) {
                    if (file) {
                        file = './services/' + file;
                    } else {
                        file = 'apiary.apib';
                    }
                    return 'node ./bin/api-blueprint-validator ' + file;
                },
                options : {
                    stdout : true,
                    stderr: false,
                    failOnError : true
                }
            }
        },

        watch: {
            apiaryDocs: {
                files: [ 'services/*.md', 'Gruntfile.js' ],
                tasks: [ 'generate-apiary-preview' ],
                options: {
                    livereload: true
                }
            }
        }
    });

    /**
     * Generates an apiary preview for an .md file
     * @param file The .md file
     * @returns {*|promise}
     */
    function generatePreview(file) {
        var deferred = q.defer();

        var blueprint = 'FORMAT: X-1A' +
            grunt.util.linefeed +
            'HOST: https://api.sparkpost.com/api/v1' +
            grunt.util.linefeed + grunt.util.linefeed +
            '# SparkPost API v1' +
            grunt.util.linefeed +
            fs.readFileSync('./services/' + file, 'utf-8');
        var embedOptions = { apiBlueprint: blueprint };

        var body = '\
<!DOCTYPE html>\n\
<html lang="en">\n\
<head>\n\
  <meta charset="UTF-8">\n\
  <title>' + file + '</title>\n\
</head>\n\
<body>\n\
  <script src="https://api.apiary.io/seeds/embed.js"></script>\n\
  <script>\n\
    var embed = new Apiary.Embed(' + JSON.stringify(embedOptions) + ');\n\
  </script>\n\
</body>\n\
</html>\
';

        var output = file.split('\.')[0] + '.html';

        fs.writeFile('./apiary-previews/' + output, body, function(err) {
            if (err) {
                grunt.log.error('There was an error trying to write to ' + output, err);
                return deferred.reject(err);
            }
            return deferred.resolve();
        });

        return deferred.promise;
    }

    // grunt generate-apiary-preview - creates apiary previews for all meta
    grunt.registerTask('generate-apiary-preview', 'Creates preview files for all md files in services', function() {
        var done = this.async();
        try {
            fs.mkdirSync('./apiary-previews');
        } catch(e){}

        fs.readdir('./services', function(err, files) {
            q.all(files.map(generatePreview)).then(done, done);
        });
    });

    function swiftypeIndex(jsonfn) {
      var deferred = q.defer(), json;

      try {
        json = fs.readFileSync('./swiftype/'+ jsonfn);
      } catch(e){ grunt.log.write(jsonfn +": "+ e +"\n"); }

      if (json !== undefined) {
        grunt.log.write('swiftype-upload read '+ json.length +' for ['+ jsonfn +"]\n");
        var obj = JSON.parse(json);

        swiftype.documents.create({
          engine: swiftypeEngine,
          documentType: swiftypeDoctype,
          document: {
            external_id: obj.id,
            fields: [
              { name: 'path', value: obj.path, type: 'string' },
              { name: 'body', value: obj.body, type: 'text' },
              { name: 'tag', value: obj.tag, type: 'enum' }
            ]
          }
        }, function(err, res) {
          if (err !== undefined && err !== null) {
            deferred.reject(err);
          } else if (res.error !== undefined) {
            deferred.reject(Error(res.error));
          }
        });
      }
      return deferred.promise;
    }

    grunt.registerTask('swiftype-upload', 'Uploads generated files to the Swiftype engine', function() {
      if (swiftypeApiKey === undefined || swiftypeApiKey === '') {
        grunt.log.error("SWIFTYPE_API_KEY not found in environment!\n");
        return null;
      }
      var done = this.async();
      swiftype = new Swiftype({ apiKey: swiftypeApiKey });

      fs.readdir('./swiftype', function(err, files) {
        if (err !== null) { done(err); }
        q.all(files.map(swiftypeIndex))
          .then(done, done)
          .done();
      });
      return;
    });

    grunt.registerTask('swiftype-gen', 'Outputs files suitable for importing into Swiftype', function() {
      var done = this.async();
      try {
        fs.mkdirSync('./swiftype');
      } catch(e){}

      fs.readdir('./services', function(err, files) {
        q.all(files.map(htmlFile)).then(function(hfiles) {
          for (var hidx in hfiles) {
            var hfile = hfiles[hidx]
              , html = undefined;
            try {
              html = fs.readFileSync(hfile);
            } catch(e){}

            if (html !== undefined) {
              $ = cheerio.load(html);
              // remove things we don't want to be indexed
              for (var tag in ['head', 'nav', 'script', 'style', 'pre']) {
                $(tag).remove();
              }

              // split each doc up into smaller chunks that can be deep linked to
              var frags = [];
              var file = (((hfile.split(/\//))[1]).split(/\./))[0].replace(/_/g, '-');

              // FIXME: this misses any text before the first element with an id
              $('*[id]').each(function(idx, elt) {
                var id = $(this).attr('id');
                id = id.replace(/^header\-/, file +'_');
                if (id === 'top') {
                  id = file +'_'+ id;
                }

                // get all the content until the next following-sibling with an id
                // don't worry about descendants with ids since we'll dedupe later
                var htmlRa = [];
                $(elt).nextUntil('*[id]').each(function(idx, elt) {
                  htmlRa.push($(elt).html());
                });

                var obj = {id: id, path: hfile};
                obj.tag = $(elt).prop('tagName');
                obj.body = $(elt).html() + htmlRa.join(' ');
                obj.body = obj.body.replace(/\s+/g, ' ');
                if (obj.body.length > 0) {
                  frags.push(obj);
                //} else {
                //  grunt.log.write("ignoring "+ id +" with length "+ obj.html.length +"\n");
                }
              });

              // accumulate all chunks of html in an array
              // iterate from largest to smallest number of characters:
              //   iterage again from current+1 to smallest, removing matching substrings
              // this is necessary because there isn't a .nextUntil(...) that
              // searches depth-first, so we end up with "abcd" and "bc",
              // grossly oversimplified
              for (var i = 0; i < frags.length; i++) {
                if (i < (frags.length-1)) {
                  for (var j = i+1; j < frags.length; j++) {
                    var idx = frags[i].body.indexOf(frags[j].body);
                    if (idx != -1) {
                      //grunt.log.write(frags[i].id +' ('+ frags[i].body.length +') contains '+ frags[j].id +' ('+ frags[j].body.length +")\n");
                      frags[i].body = frags[i].body.substring(0, idx) + frags[i].body.substring(idx + frags[j].body.length);
                      //grunt.log.write(frags[i].id +' ('+ frags[i].body.length +") after dedupe\n");
                    }
                  }
                }

                // normalize space so words aren't stuck together after striptags
                var eltBody = frags[i].body;
                eltBody = eltBody.replace(/([^ ])</g, '$1 <');
                eltBody = eltBody.replace(/>([^ ])/g, '> $1');
                eltBody = striptags(eltBody);
                eltBody = eltBody.replace(/\s{2,}/g, ' ');
                grunt.log.write("file="+ frags[i].path +", tag="+ frags[i].tag +", id=["+ frags[i].id +"], len=["+ eltBody.length +"]\n");
                frags[i].body = eltBody;

                var fn = 'swiftype/' + frags[i].id +'.json';
                var json = JSON.stringify(frags[i]);
                //json = json.replace(/&#x[0-9a-fA-F]+;/g, '');
                fs.writeFileSync(fn, json, 'utf-8');
              }
            } else {
              grunt.log.write('swiftype-gen: ERROR reading '+ hfile +"\n");
            }
          }
        }).then(done, done);
      });
    });

    // grunt testFiles - runs apiary-blueprint-validator on individual blueprint files
    grunt.registerTask('testFiles', 'Validates individual blueprint files', services.map(function(s) {
        return 'shell:test:' + s;
    }));

    //grunt preview - creates a live-reloaded preview of the docs, Apiary-style
    grunt.registerTask('preview', 'View the apiary generated HTML files in the browser with all that live-reload goodness', [
        'generate-apiary-preview',
        'connect:apiary',
        'watch:apiaryDocs'
    ]);

    // grunt test - runs apiary-blueprint-validator on combined apiary.apib file
    grunt.registerTask('test', [ 'shell:test' ]);

    // grunt compile - concatenates all the individual blueprint files and validates it
    grunt.registerTask('compile', [ 'concat:prod', 'test' ]);

    // register default grunt command as grunt test
    grunt.registerTask('default', [ 'testFiles' ]);
};
