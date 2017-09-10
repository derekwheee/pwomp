require("../common/_bootstrap");

const test = require('ava');
const path = require('path');
const util = require('../../lib/util');

test('normalize path', t => {
    const testPath = 'test/path.txt';
	t.is(util.normalizePath(testPath), path.resolve(testPath));
});