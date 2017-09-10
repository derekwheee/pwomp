require("../../common/_bootstrap");

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

test('parse metadata', t => {
    const content = [`
        ---
        title: Homepage
        controller: homepage
        ---
    `];
    const metadata = compiler.__parseMetadata(content);

    t.is(metadata.title, 'Homepage');
    t.is(metadata.controller, 'homepage');
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
