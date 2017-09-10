const fs = require('fs-extra');
const config = require('./config');
const log = require('./log')();

function scaffold() {

    // Silently log unhandled promise rejections
    process.on('unhandledRejection', (error) => {
        log.error(`Unhandled promise rejection:`, true);
        log.error(error, true);
    });

    if (process.env.NODE_ENV === 'test') {
        if (!fs.existsSync(config.CHECK_DIRECTORY)) {
            fs.mkdirSync(config.CHECK_DIRECTORY);
        }
    }
}

module.exports = scaffold;