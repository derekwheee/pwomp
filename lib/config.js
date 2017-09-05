const SETTINGS = require('rc')('exemplar', {
    viewsDir : './src/views/',
    layoutsDir : './src/views/layouts/',
    partialsDir : './src/views/partials/',
    sassDir : './src/scss/',
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

module.exports = {
    CHECK_DIRECTORY : CHECK_DIRECTORIES[environment],
    INSTALL_DIRECTORY : INSTALL_DIRECTORIES[environment],
    REPO_PATH : 'frxnz/exemplar',
    SETTINGS,
};