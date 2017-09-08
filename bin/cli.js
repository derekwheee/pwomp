#!/usr/bin/env node

const program = require('commander');
const version = require('../package.json').version;
const scaffold = require('../lib/scaffold')();
const log = require('../lib/log');
const create = require('../lib/tasks/create');
const serve = require('../lib/tasks/serve');
const build = require('../lib/tasks/build');
const JsCompiler = require('../lib/compilers/js');
const SassCompiler = require('../lib/compilers/sass');
const ViewCompiler = require('../lib/compilers/views');

program
    .version(version);

program
    .command('new [name]')
    .description('create new Exemplar project in the current directory')
    .alias('n')
    .action(create);

program
    .command('serve')
    .description('serve static site for development')
    .alias('s')
    .action(serve);

program
    .command('build')
    .description('parse project files into build directory')
    .alias('b')
    .action(build);

program
    .command('compile [compiler]')
    .description('compile files')
    .action((compiler) => {
        const compilers = {
            sass : function () {
                const s = new SassCompiler();
                s.compile();
            },
            js : function () {
                const s = new JsCompiler();
                s.compile();
            },
            views : function () {
                const s = new ViewCompiler();
                s.compile();
            }
        };

        if (compiler in compilers) {
            compilers[compiler]();
        }
    });

program
    .command('watch [watcher]')
    .description('watch files')
    .action((watcher) => {
        const watchers = {
            sass : function () {
                const s = new SassCompiler();
                s.watch();
            },
            js : function () {
                const s = new JsCompiler();
                s.watch();
            },
            views : function () {
                const s = new ViewCompiler();
                s.watch();
            }
        };

        if (watcher in watchers) {
            watchers[watcher]();
        }
    });

program.parse(process.argv);