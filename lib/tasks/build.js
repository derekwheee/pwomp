const log = require('../log');
const clean = require ('./clean');
const copy = require ('./copy');
const SassCompiler = require('../compilers/sass');
const ViewCompiler = require('../compilers/views');

async function build() {

    log.status('Building project...');

    // Run sub-tasks
    await clean();
    await copy();

    // Run compilers
    const viewCompiler = new ViewCompiler();
    viewCompiler.compile();

    const sassCompiler = new SassCompiler({ isBuild : true })
    sassCompiler.compile();

}

module.exports = build;