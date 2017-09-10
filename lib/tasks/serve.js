const log = require('./log')();
const server = require('../server');
const clean = require ('./clean');
const copy = require ('./copy');
const JsCompiler = require('../compilers/js');
const SassCompiler = require('../compilers/sass');
const ViewCompiler = require('../compilers/views');

async function serve() {

    // Run sub-tasks
    await clean();
    await copy();

    copy.watch();

    // Run compilers
    const viewCompiler = new ViewCompiler();
    viewCompiler.watch();

    const sassCompiler = new SassCompiler();
    sassCompiler.watch();

    const jsCompiler = new JsCompiler();
    jsCompiler.watch();

    // Start server
    log.status('Preparing site server...');

    const site = server();

    // Handle kill process
    process.on('SIGINT', function() {
        // todo: Figure out why process doesn't always exit immediately
        log.status('Closing site server...');
        site.close(() => {
            log.success('Bye 👋');
            process.exit();
        });
    });

}

module.exports = serve;