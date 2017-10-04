const path = require('path');
const putil = require('pwomp-util');
const util = require ('./util');

const environment = process.env.NODE_ENV || 'default';

const CHECK_DIRECTORIES = {
    'test' : './test/assets/dummy',
    'default' : './',
};

const INSTALL_DIRECTORIES = {
    'test' : './test/assets/dummy',
    'default' : './',
};

const HELPER_DIRECTORY = './lib/helpers/';

module.exports = {
    CHECK_DIRECTORY : CHECK_DIRECTORIES[environment],
    INSTALL_DIRECTORY : INSTALL_DIRECTORIES[environment],
    HELPER_DIRECTORY,
    SETTINGS : putil.settings,
    getPath : putil.settings.getPath,
};