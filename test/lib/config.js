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

test.skip('load .exemplarrc', t => {
    // save temp copy of .exemplarrc
    // write test copy of .exemplarrc
    // test loaded values
});