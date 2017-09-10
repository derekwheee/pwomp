const spawn = require('cross-spawn');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const config = require('../config');
const log = require('./log')();

async function create (name = '') {

    const isClean = await isCleanDirectory();

    if (isClean) {
        processInstructions();
    } else {
        const instruction = await requestInstructions();
        processInstructions(instruction);
    }

    async function isCleanDirectory() {

        await fs.ensureDir(`${config.CHECK_DIRECTORY}/${name}`);

        const files = await fs.readdir(`${config.CHECK_DIRECTORY}/${name}`);

        return !files.length;
    }

    async function downloadFiles() {
        return new Promise((resolve, reject) => {

            log.status('Downloading Exemplar files...')

            download(config.REPO_PATH, `${config.INSTALL_DIRECTORY}/${name}`, function (err) {
                if (err) {
                    reject(err);
                } else {
                    log.success('Exemplar files downloaded!')
                    resolve();
                }
            });
        })
    }

    async function requestInstructions() {

        log.warn('This folder is not empty')

        const answers = await inquirer.prompt([{
            message : 'Do you want to:',
            type : 'list',
            name : 'instructions',
            default : 'Cancel',
            choices : [
                'Overwrite existing files',
                'Add to existing files',
                'Cancel',
            ]
        }]);

        return answers.instructions;
    }

    async function processInstructions(instruction = 'Overwrite existing files') {
        const methods = {
            ['Overwrite existing files'] : overwrite,
            ['Add to existing files'] : append,
        };

        if (instruction === 'Cancel') return;

        await methods[instruction]();
        installPackages();

        async function overwrite() {
            await fs.emptyDir(`${config.INSTALL_DIRECTORY}/${name}`);
            await downloadFiles();
        }

        async function append() {
            await downloadFiles();
        }
    }

    async function installPackages() {
        log.status('Installing packages...')

        const npm = spawn('npm', ['install'], { cwd : `${config.INSTALL_DIRECTORY}/${name}`, stdio : 'inherit' });

        npm.on('error', (err) => {
            log.error(err);
        });

        npm.on('close', (code) => {
            if (code === 0) {
                log('Packages installed!');
            }
        });
    }

}

module.exports = create;