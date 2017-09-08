const path = require('path');
const util = require ('./util');

const SETTINGS = require('rc')('exemplar', {
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

const environment = process.env.NODE_ENV || 'default';

const CHECK_DIRECTORIES = {
    'test' : './dummy',
    'default' : './',
};

const INSTALL_DIRECTORIES = {
    'test' : './tmp',
    'default' : './',
};

const HELPER_DIRECTORY = './lib/helpers/';

module.exports = {
    CHECK_DIRECTORY : CHECK_DIRECTORIES[environment],
    INSTALL_DIRECTORY : INSTALL_DIRECTORIES[environment],
    REPO_PATH : 'frxnz/exemplar',
    HELPER_DIRECTORY,
    SETTINGS,
    getPath : function(dest) {
        return util.normalizePath(path.join(process.cwd(), SETTINGS.srcDir, SETTINGS[dest]));
    }
};