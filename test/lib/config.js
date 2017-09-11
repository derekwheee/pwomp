require("../common/_bootstrap");

const test = require('ava');
const path = require('path');
const config = require('../../lib/config');

test('loaded', t => {
	t.true(config && 'SETTINGS' in config);
});

test('get path', t => {
    t.is(
        config.getPath('viewsDir'),
        path.resolve((path.join(process.cwd(), config.SETTINGS.srcDir, config.SETTINGS.viewsDir)))
    );
});

test('load .exemplarrc', t => {
    t.is(config.SETTINGS.srcDir, './test/assets/src/');
});