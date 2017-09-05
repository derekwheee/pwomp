const log = require('../log');
const server = require('../server');

function serve() {

    log.status('Preparing site server...');

    const site = server();

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