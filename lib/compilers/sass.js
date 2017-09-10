const path = require('path');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const config = require('../config');
const log = require('./log')();
const util = require('../util');
const $ = require('gulp-load-plugins')();

class SassCompiler {
    constructor(options = {}) {
        this.opts = {
            outputStyle : options.isBuild ? 'compressed' : 'expanded',
        };

        gulp.task('sass', () => {
            return gulp.src(path.join(config.getPath('sassDir'), '**/*.scss'))
                .pipe($.sass(this.opts).on('error', $.sass.logError))
                .pipe($.autoprefixer())
                .pipe(gulp.dest(util.normalizePath(path.join(config.SETTINGS.outputDir, 'css'))));
        });
    }

    async compile() {
        log.status('Starting \'sass\'...')
        await gulp.start('sass');
        log.success('Finished \'sass\'')
    }

    async watch() {
        log.status('Watching sass files')
        await gulp.start('sass');
        gulp.watch(path.join(config.getPath('sassDir'), '**/*.scss'), async function(event) {
            log.info(`${event.path} ${event.type}, running tasks...`);
            await gulp.start('sass');
            log.success('Finished \'sass\'...')
        });
    }

}

module.exports = SassCompiler;