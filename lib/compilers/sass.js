const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const config = require('../config');
const log = require('../log');
const $ = require('gulp-load-plugins')();

class SassCompiler {
    constructor(options = {}) {
        this.opts = {
            outputStyle : options.isBuild ? 'compressed' : 'expanded',
        };

        gulp.task('sass', () => {
            return gulp.src(`${config.SETTINGS.sassDir}**/*.scss`)
                .pipe($.sass(this.opts).on('error', $.sass.logError))
                .pipe($.autoprefixer())
                .pipe(gulp.dest(`${config.SETTINGS.outputDir}/css/`));
        });
    }

    async compile() {
        log.status('Starting \'sass\'...')
        await gulp.start('sass');
        log.status('Finished \'sass\'...')
    }

    async watch() {
        log.status('Watching sass files')
        gulp.watch(`${config.SETTINGS.sassDir}**/*.scss`, function(event) {
            log.info(`${event.path} ${event.type}, running tasks...`);
            run();
        });
    }

}

module.exports = SassCompiler;