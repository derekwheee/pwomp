const path = require('path');
const config = require('./lib/config.js');

module.exports = {
    entry: `${config.getPath('scriptsDir')}/index.js`,
    output: {
        filename: 'bundle.js',
        path: path.resolve(config.SETTINGS.outputDir, 'js'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
};