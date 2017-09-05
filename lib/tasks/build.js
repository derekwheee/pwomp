const log = require('../log');
const ViewCompiler = require('../compilers/views');

function build() {

    log.status('Building project...');

    const viewCompiler = new ViewCompiler();

    viewCompiler.compile();

}

module.exports = build;