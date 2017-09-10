const test = require('ava');
const sinon = require('sinon');
let log;
let mockLogger;

test.beforeEach(t => {
    mockLogger = {
        log : sinon.spy(),
        error : sinon.spy(),
        warn : sinon.spy(),
    };

    log = require('../lib/log')(mockLogger);
})

test('structure', t => {
    t.is(typeof log, 'function');
    t.true('error' in log);
});

test('log', t => {
    log('This is a test');
    t.true(mockLogger.log.calledOnce);
})

test('silent log', t => {
    log('This is a test', true);
    t.true(mockLogger.log.notCalled);
})