/* jshint laxcomma: true, multistr: true */
var matchdep = require('matchdep')
    , fs = require('fs')
    , q = require('q')
    , request = require('request')
    , rewriteRulesSnippet = require("grunt-connect-rewrite/lib/utils").rewriteRequest
    , algoliaTools = require('./algoliaTools')
    , services = [
        'introduction.md',
        'substitutions-reference.md',
        'account.md',
        'bounce-domains.md',
        'inbound-domains.md',
        'ip-pools.md',
        'metrics.md',
        'message-events.md',
        'recipient-lists.md',
        'relay-webhooks.md',
        'sending-domains.md',
        'sending-ips.md',
        'subaccounts.md',
        'suppression-list.md',
        'templates.md',
        'tracking-domains.md',
        'transmissions.md',
        'webhooks.md',
        'smtp-api.md'
    ]
    , staticTempDir = 'static/';

function _md2html(obj, val, idx) {
    var name = (val.split('.'))[0];
    if (val === 'introduction.md') {
        name = 'index';
    }
    obj[staticTempDir + name +'.html'] = [ 'services/'+ val ];
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
    return staticTempDir + name +'.html';
}

module.exports = function(grunt) {
    // Relative to staticTempDir (!)
    if (!grunt.option('output')) {
      grunt.option('output', '../sparkpost.github.io/_api/');
    }

    if (!grunt.option('searchContentFile')) {
      grunt.option('searchContentFile', 'forAlgolia.json');
    }

    grunt.option('aglioTemplate', 'production');

    // Dynamically load any preexisting grunt tasks/modules
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    var cheerio = require('cheerio');

    // Tell aglio / olio not to cache rendered output
    process.env.NOCACHE = '1';

    // Configure existing grunt tasks and create custom ones
    grunt.initConfig({
        aglio: {
            build: {
                files: services.reduce(_md2html, {})
            },
          options: {
            themeTemplate: 'templates/<%= grunt.option("aglioTemplate") %>/index.jade',
            themeFullWidth: true,
            themeEmoji: false,
            locals: {
              _: require('lodash'),
              baseURI: '/api/v1'
            }
          }
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
                            var filename = (file.split('/'))[1].replace('.html', '');
                            var href;

                            if (obj.parent().attr('class') == 'heading') {
                              href = filename;
                            } else {
                              href = filename + obj.attr('href');
                            }
                            // Rename #top anchor so auto-expansion works as expected.
                            if (href == 'substitutions-reference.html#top') {
                                href = filename + '#substitutions-reference-top';
                            }
                            obj.attr('href', href);
                          }
                        );

                        var name = (file.split('.'))[0];
                        name = (name.split('/'))[1];
                        // Fix nav name, it's Overview for some reason
                        if (name == 'substitutions-reference') {
                            $('nav div.heading a[href^="substitutions-reference"]').text('Substitutions Reference');
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
            fixup_nav: {
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
                        var curNav = 'div.heading a[href^="'+ file.replace('.html', '') +'"]';

                        // indicate current page w/in nav
                        $(curNav).parent().addClass('current');
                        allnav = $.html();

                        // add more ids, to split up some of the bigger sections
                        $ = cheerio.load(content);
                        $('div.title strong code').each(function(idx, elt) {
                          var text = $(elt).text();
                          if (!text.match(/^\d+$/)) {
                            var anchor = text.toLowerCase().replace(/\s+/g, '-');
                            $(elt).parents('div.title').attr('id', anchor);
                          }
                        });
                        content = $.html();

                        // replace single-page nav with the global nav we built above
                        content = content.replace(/<nav([^>]*)>.*?<\/nav>/, '<nav$1>'+ allnav +'</nav>');

                        return content;
                    }
                }
            },

            static_to_devhub: {
                expand: true,
                cwd: staticTempDir,
                src:'*.html',
                dest: '<%= grunt.option("output") %>',
                flatten: true
            },

          static_preview_css: {
            src: 'templates/preview/main.css',
            dest: '<%= grunt.option("output") %>/'
          }
        },

      connect: {
        options: {
          port: 4000,
          hostname: '0.0.0.0',
          open: true,
        },
        rules: [
          {
            from: '(^((?!css|html|js|img|fonts|\/$).)*$)',
            to: '$1.html'
          }
        ],
        staticPreview: {
          options: {
            middleware: function(connect) {
              return [
                rewriteRulesSnippet,
                require('connect-livereload')(),
                connect.static('static'),
                connect.directory('static')
              ];
            }
          }
        }
      },

        shell: {
            test: {
                command : function(file) {
                    file = './services/' + file;
                    return './bin/validate.sh ' + file;
                },
                options : {
                    stdout : true,
                    stderr: true,
                    failOnError : true
                }
            }
        },

        watch: {
            staticDocs: {
                files: [ 'services/*.md', 'templates/production/*.jade', 'Gruntfile.js' ],
                tasks: [ 'static' ],
                options: {
                    livereload: false
                }
            },
            staticPreview: {
                files: [ 'services/*.md', 'templates/preview/*.jade', 'Gruntfile.js' ],
                tasks: [ 'genStaticPreview' ],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.registerTask('createSearchContent', 'Convert Apiary blueprints into content for Algolia to index', function() {
      var searchContentFile = grunt.option('searchContentFile');

      if (!searchContentFile) {
        grunt.fail.fatal('Required option missing: searchContentFile');
        return null;
      }

      var done = this.async();
      algoliaTools.createSearchContent(services, searchContentFile)
      .then(function() {
        grunt.log.writeln('Search content written to ' + searchContentFile);
        done();
      })
      .catch(function(err) {
        grunt.fail.fatal(err);
      });
    });

    grunt.registerTask('updateAlgolia', 'Uploads generated content to the Algolia engine for indexing', function() {
      var opts = {
        searchContentFile: null,
        algoliaAPIKey: null,
        algoliaAppID: null,
        algoliaIndexName: null
      }
      , ok = true;

      Object.keys(opts).forEach(function(key) {
        opts[key] = grunt.option(key);
        if (!opts[key]) {
          grunt.fail.fatal('Required option missing: ' + key);
          ok = false;
        }
      });

      if (!ok) {
        return null;
      }

      var done = this.async();
      algoliaTools.updateSearchIndex(opts.searchContentFile,
        opts.algoliaAppID, opts.algoliaAPIKey, opts.algoliaIndexName, grunt.log.writeln)
      .then(done)
      .catch(function(err) {
        grunt.fail.fatal(err);
      });
    });

    // Internal: grunt genStaticPreview: build preview HTML under static/
    grunt.registerTask('genStaticPreview', '', function() {
      // Call aglio with a preview template
      grunt.option('aglioTemplate', 'preview');
      grunt.option('output', 'static');
      grunt.task.run(['aglio', 'dom_munger', 'copy:fixup_nav', 'copy:static_preview_css']);
    });

    // build preview HTML under static/, open a browser and watch for changes
    grunt.registerTask('staticPreview', ['preview']);
    grunt.registerTask('preview', 'View the static generated HTML files in the browser', [
        'configureRewriteRules',
        'genStaticPreview',
        'connect:staticPreview',
        'watch:staticPreview'
    ]);

    // runs api-blueprint-validator on individual blueprint files
    grunt.registerTask('test', 'Validates individual blueprint files', services.map(function(s) {
        return 'shell:test:' + s;
    }));

    // grunt staticDev: build API HTML files, copy to local DevHub copy and then watch for changes
    // Use --output change the location of the resulting API doc files.
    grunt.registerTask('staticDev', ['static', 'watch:staticDocs']);

    // grunt static: validate api blueprint, build API HTML files and copy to local DevHub copy
    // Use --output change the location of the resulting API doc files.
    grunt.registerTask('static', ['test', 'aglio', 'dom_munger', 'copy:fixup_nav', 'copy:static_to_devhub']);

    // Generate and upload new search content to Algolia
    grunt.registerTask('syncSearch', ['createSearchContent', 'updateAlgolia']);

    // register default grunt command as grunt test
    grunt.registerTask('default', [ 'test' ]);
};
