const log = require('../log');
const ViewCompiler = require('../compilers/views');
const SassCompiler = require('../compilers/sass');

function build() {

    log.status('Building project...');

    // Run compilers
    const viewCompiler = new ViewCompiler();
    viewCompiler.compile();

    const sassCompiler = new SassCompiler({ isBuild : true })
    sassCompiler.compile();

}

module.exports = build;