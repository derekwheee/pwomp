#!/usr/bin/env node

const program = require('commander');
const version = require('../package.json').version;
const scaffold = require('../lib/scaffold')();
const log = require('../lib/log');
const create = require('../lib/create');

program
    .version(version);

program
    .command('new [name]')
    .description('create new Exemplar project in the current directory')
    .alias('n')
    .action(create);

program.parse(process.argv);