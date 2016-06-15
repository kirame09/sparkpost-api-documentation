var matchdep = require('matchdep')
    , fs = require('fs')
    , q = require('q')
    , request = require('request')
    , rewriteRulesSnippet = require("grunt-connect-rewrite/lib/utils").rewriteRequest
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
    return name
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
                                    grunt.log.fatal('no nav html for ['+ name +'], run dom_munger before copy!');
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
        apiary: {
          options: {
            middleware: function(connect) {
              return [
                require('connect-livereload')(),
                connect.static('apiary-previews'),
                connect.directory('apiary-previews')
              ];
            }
          }
        },
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
            },
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

    // Internal: grunt genStaticPreview: build preview HTML under static/
    grunt.registerTask('genStaticPreview', '', function() {
      // Call aglio with a preview template
      grunt.option('aglioTemplate', 'preview');
      grunt.option('output', 'static');
      grunt.task.run(['aglio', 'dom_munger', 'copy:fixup_nav', 'copy:static_preview_css']);
    });

    // grunt staticPreview: build preview HTML under static/, open a browser and watch for changes
    grunt.registerTask('staticPreview', 'View the static generated HTML files in the browser', [
        'configureRewriteRules',
        'genStaticPreview',
        'connect:staticPreview',
        'watch:staticPreview'
    ]);

    // grunt test - runs apiary-blueprint-validator on combined apiary.apib file
    grunt.registerTask('test', [ 'shell:test' ]);

    // DEPRECATED: grunt compile - concatenates all the individual blueprint files and validates it
    grunt.registerTask('compile', [ 'concat:prod', 'test' ]);

    // grunt staticDev: build API HTML files, copy to local DevHub copy and then watch for changes
    // Use --output change the location of the resulting API doc files.
    grunt.registerTask('staticDev', ['static', 'watch:staticDocs']);

    // grunt static: validate apiary blueprint, build API HTML files and copy to local DevHub copy
    // Use --output change the location of the resulting API doc files.
    grunt.registerTask('static', ['test', 'aglio', 'dom_munger', 'copy:fixup_nav', 'copy:static_to_devhub']);

    // register default grunt command as grunt test
    grunt.registerTask('default', [ 'testFiles' ]);
};
