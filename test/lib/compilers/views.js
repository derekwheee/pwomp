require("../../common/_bootstrap");

const fs = require('fs-extra');
const path = require('path');
const test = require('ava');
const ViewCompiler = require('../../../lib/compilers/views');
const config = require('../../../lib/config');
let compiler;

test.cb.before(t => {
    compiler = new ViewCompiler();

    // View compiler needs to read some files before it's ready
    setTimeout(t.end, 100);
});

test('constructor', async t => {
    t.true(compiler.isReady);
});

test('prefixes', t => {
    t.is(compiler.__layoutPrefix, path.normalize('layouts/'));
    t.is(compiler.__partialPrefix, path.normalize('partials/'));
});

test('read views', async t => {
    t.true(compiler.views.length > 0);
});

test('read layouts', async t => {
    t.true(compiler.layouts.length > 0);
});

test('read partials', async t => {
    t.true(compiler.partials.length > 0);
});

test('view destination path', t => {
    const destination1 = compiler.__getViewDestinationPath({
        name : 'test/view'
    });
    const destination2 = compiler.__getViewDestinationPath('test/view');

    t.is(destination1, `${config.SETTINGS.outputDir}test/view/index.html`);
    t.is(destination2, `${config.SETTINGS.outputDir}test/view/index.html`);
});
