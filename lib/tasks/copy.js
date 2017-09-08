const promisify = require('promisify-node');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const glob = promisify('glob');
const path = require('path');
const config = require('../config');
const log = require('../log');
const util = require('../util');

const ignorePaths = [
    config.getPath('viewsDir'),
    config.getPath('layoutsDir'),
    config.getPath('partialsDir'),
    config.getPath('sassDir'),
    config.getPath('scriptsDir'),
];

async function copy() {

    log.status('Copying static files...');

    const filenames = await glob(path.resolve(util.normalizePath(config.SETTINGS.srcDir), '**/*.*'), {
        ignore : `{${ignorePaths.join(',')}}/**`
    });

    await filenames.map(async (filename) => {
        try {
            filename = path.resolve(filename);
            await fs.copy(filename, path.join(util.normalizePath(config.SETTINGS.outputDir), filename.replace(path.resolve(config.SETTINGS.srcDir), '')));
        } catch (err) {
            log.error(err);
        }
    });

    log.success('Static files copied!');

}

copy.watch = async function () {

    log.status('Watching static files for changes');

    const watcher = chokidar.watch(config.SETTINGS.srcDir, {
        awaitWriteFinish : {
            stabilityThreshold: 100,
            pollInterval: 100
        }
    });

    watcher.on('add', handleChange.bind(this));
    watcher.on('change', handleChange.bind(this));
    watcher.on('unlink', handleDelete.bind(this));

    async function handleChange(filename) {
        filename = util.normalizePath(filename);

        const isIgnored = ignorePaths.find(p => filename.includes(p));

        if (isIgnored) return;

        log.status(`${filename} changed, copying...`);
        await fs.copy(filename, path.join(util.normalizePath(config.SETTINGS.outputDir), filename.replace(path.resolve(config.SETTINGS.srcDir), '')));
        log.success(`${filename} copied`);
    }

    async function handleDelete(filename) {
        filename = util.normalizePath(filename);

        const isIgnored = ignorePaths.find(p => filename.includes(p));

        if (isIgnored) return;

        log.status(`${filename} removed, deleting...`);
        await fs.remove(`${config.SETTINGS.outputDir}${filename.replace(config.SETTINGS.srcDir, '')}`);
        log.success(`${filename} deleted`);
    }

};

module.exports = copy;