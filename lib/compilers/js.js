const path = require('path');
const webpack = require('webpack');
const config = require('../config');
const log = require('./log')();
let webpackConfig;

try {
    webpackConfig = require(path.resolve(process.cwd(), 'webpack.config.js'));
} catch(err) {
    webpackConfig = require('../../webpack.config.js');
}

class JsCompiler {
    constructor() {
        this.compiler = webpack(webpackConfig);
    }

    compile() {
        return new Promise((resolve, reject) => {
            log.status('Starting \'js\'...')
            this.compiler.run(function(err, stats) {
                if (err) {
                    log.error(err);
                    return reject(err);
                }
                // log.info(stats);
                log.status('Finished \'js\'...')
                return resolve(stats);
            });
        });
    }

    watch() {
        return new Promise((resolve, reject) => {
            this.compiler.watch({}, function(err, stats) {
                if (err) {
                    log.error(err);
                    return reject(err);
                }
                log.info(stats);
                return resolve(stats);
            });
        });
    }
}

module.exports = JsCompiler;