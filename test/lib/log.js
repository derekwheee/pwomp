require("../common/_bootstrap");

const test = require('ava');
const sinon = require('sinon');
const log = require('../../lib/log');

test.beforeEach(t => {
    sinon.spy(console, 'log');
})

test.afterEach(function() {
    console.log.restore();
});

test.serial('structure', t => {
    t.is(typeof log, 'function');
    t.true('error' in log);
});

test.serial('log', t => {
    log('This is a test');
    t.true(console.log.calledOnce);
})

test.serial('silent log', t => {
    log('This is a test', true);
    t.true(console.log.notCalled);
})