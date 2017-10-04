const path = require('path');
const util = require ('./util');

const environment = process.env.NODE_ENV || 'default';

const SETTINGS = require('rc')('pwomp', {
    srcDir : './src/',
    viewsDir : 'views/',
    layoutsDir : 'views/layouts/',
    partialsDir : 'views/partials/',
    helpersDir : 'views/helpers/',
    sassDir : 'scss/',
    scriptsDir : 'js/',
    iconDir : 'icons/',
    outputDir : './dist/',
    defaultLayout : 'main',
    layoutReplacer : '{{{body}}}',
    viewExtension : 'hbs',
    minifyOptions : {
        collapseWhitespace : true,
    },
    server : {
        port : 3000,
        useSSL : true,
    },
});

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
    SETTINGS,
    getPath : function(dest) {
        return util.normalizePath(path.join(process.cwd(), SETTINGS.srcDir, SETTINGS[dest]));
    }
};