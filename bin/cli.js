#!/usr/bin/env node

const program = require('commander');
const version = require('../package.json').version;
const scaffold = require('../lib/scaffold')();
const log = require('../lib/log');
const create = require('../lib/create');
const serve = require('../lib/tasks/serve');
const build = require('../lib/tasks/build');

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

program.parse(process.argv);