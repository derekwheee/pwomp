const log = require('../log');
const clean = require ('./clean');
const copy = require ('./copy');
const JsCompiler = require('../compilers/js');
const SassCompiler = require('../compilers/sass');
const ViewCompiler = require('../compilers/views');

async function build() {

    log.status('Building project...');

    // Run sub-tasks
    await clean();
    await copy();

    // Run compilers
    const viewCompiler = new ViewCompiler({ isBuild : true });
    viewCompiler.compile();

    const sassCompiler = new SassCompiler({ isBuild : true });
    sassCompiler.compile();

    const jsCompiler = new JsCompiler({ isBuild : true });
    jsCompiler.compile();

}

module.exports = build;