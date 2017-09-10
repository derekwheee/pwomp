const fs = require('fs-extra');
const config = require('../config');
const log = require('../log');

async function clean() {

    log.status('Cleaning output directory...');

    await fs.emptyDir(config.SETTINGS.outputDir);

    log.success('Output directory cleaned!');
}

module.exports = clean;