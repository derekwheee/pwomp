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
    setTimeout(t.end, 50);
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

test('parse metadata', async t => {
    const content = await fs.readFile(path.resolve(config.getPath('viewsDir'), 'index.hbs'), 'utf-8');
    const metadata = compiler.__parseMetadata(content.match(/^---[\s\S]*---/));

    t.is(metadata.title, 'Home');
    t.is(metadata.controller, 'homepage');
});

test('parse view', async t => {
    const data = {
        template : await fs.readFile(path.resolve(config.getPath('viewsDir'), 'index.hbs'), 'utf-8')
    };
    const view = compiler.__parseView(data, true);

    t.is(view.data.title, 'Home');
    t.is(view.data.controller, 'homepage');
    t.is(view.data.layout, 'main');
    t.true(view.template.includes('This is a test homepage'));
});

test('get default layout', t => {
    t.is(compiler.__getLayout({}), config.SETTINGS.defaultLayout);
});

test('view destination path', t => {
    const destination1 = compiler.__getViewDestinationPath({
        name : 'test/view'
    });
    const destination2 = compiler.__getViewDestinationPath('test/view');

    t.is(destination1, `${config.SETTINGS.outputDir}test/view/index.html`);
    t.is(destination2, `${config.SETTINGS.outputDir}test/view/index.html`);
});
