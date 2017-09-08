const promisify = require('promisify-node');
const chokidar = require('chokidar');
const fs = require('fs-extra');
const equal = require('deep-equal');
const glob = promisify('glob');
const handlebars = require('handlebars');
const minify = require('html-minifier').minify;
const path = require('path');
const config = require('../config');
const log = require('../log');
const util = require('../util');

class ViewCompiler {
    constructor() {
        this.isReady = false;
        this.queue = [];

        this.__layoutPrefix = path.normalize(`${config.getPath('layoutsDir').replace(config.getPath('viewsDir'), '').replace(/^[\\\/]/, '')}/`)
        this.__partialPrefix = path.normalize(`${config.getPath('partialsDir').replace(config.getPath('viewsDir'), '').replace(/^[\\\/]/, '')}/`)

        console.log(this.__partialPrefix);

        this.__init();
    }

    async compile() {

        if (!this.isReady) {
            this.queue.push(this.compile.bind(this));
            return;
        }

        this.views.map(await this.__createFileFromView.bind(this));

        log.success('Views compiled!');

    }

    async watch() {

        if (!this.isReady) {
            this.queue.push(this.watch.bind(this));
            return;
        }

        log.status('Watching views for changes');

        const watcher = chokidar.watch(`${config.getPath('viewsDir')}/**/*.hbs`, {
            awaitWriteFinish : {
                stabilityThreshold: 100,
                pollInterval: 100
            }
        });

        this.compile();

        watcher.on('add', handleChange.bind(this));
        watcher.on('change', handleChange.bind(this));
        watcher.on('unlink', handleDelete.bind(this));
        
        // todo: Watcher chokes when deleting a watched folder on Windows
        // https://github.com/paulmillr/chokidar/issues/566

        async function handleChange(filename) {
            const view = await this.__fileToViewObject(filename, true);
            let oldView;

            if (view.name.includes(this.__layoutPrefix)) {
                oldView = this.layouts.find(v => v.name === view.name);
            }
            else if (view.name.includes(this.__partialPrefix)) {
                oldView = this.partials.find(v => v.name === view.name);
            } else {
                oldView = this.views.find(v => v.name === view.name);
            }

            if (equal(view, oldView)) return;

            log.status(`${filename} changed, compiling...`);

            await this.__createFileFromView(view);
            
            log.success(`${filename} updated`);
        }

        async function handleDelete(filename) {
            const ignorePaths = [
                config.getPath('layoutsDir'),
                config.getPath('partialsDir'),
            ];

            filename = util.normalizePath(filename);

            const isIgnored = ignorePaths.find(p => filename.includes(p));

            if (isIgnored) return;

            log.status(`${filename} removed, deleting...`);
            await this.__deleteViewFile(filename);
            log.success(`${filename} deleted`);
        }

    }

    async __init() {
        this.layouts = await this.__getLayouts();
        this.partials = await this.__getPartials();
        this.views = await this.__getViews();

        this.__registerPartials();
        await this.__registerHelpers();

        this.isReady = true;
        
        this.__processQueue();
    }

    __processQueue() {

        if (!this.queue.length) return;

        this.queue.forEach((func) => {
            func();
        });
    }

    async __getLayouts() {
        return await this.__dirContentsToObject(config.getPath('layoutsDir'));
    }

    async __getPartials() {
        return await this.__dirContentsToObject(config.getPath('partialsDir'));
    }

    async __getViews() {
        const ignore = [
            config.getPath('layoutsDir'),
            config.getPath('partialsDir'),
        ];
        return await this.__dirContentsToObject(config.getPath('viewsDir'), ignore);
    }

    __registerPartials() {
        this.partials.forEach((partial) => {
            handlebars.registerPartial(partial.name.replace(this.__partialPrefix, ''), partial.template);
        });
    }

    async __registerHelpers() {
        const helperFiles = await glob(`${config.HELPER_DIRECTORY}/**/*.js`);
        const externalHelperFiles = await glob(`${config.getPath('helpersDir')}/**/*.js`);

        [...helperFiles, ...externalHelperFiles].forEach((file) => {
            try {
                handlebars.registerHelper(file.split('/').pop().replace('.js', ''), require(path.resolve(file)));
            } catch(err) {
                log.error(err);
            }
        });
    }

    async __dirContentsToObject(directory, ignore) {
        
        directory = this.__normalizeDirectoryPath(directory);

        try {
            const filenames = await glob(`${directory}**/*.${config.SETTINGS.viewExtension}`, {
                ignore : ignore ? `{${ignore.join(',')}}/**` : null
            });
            return await Promise.all(filenames.map(this.__fileToViewObject.bind(this)));
        } catch (err) {
            log.error(err);
        }
    }

    async __fileToViewObject(filename, forceLayout) {
        const path = util.normalizePath(filename);
        const content = await fs.readFile(path, 'utf-8');
        return this.__parseView({
            name : this.__getViewNameFromFilename(path),
            template : content,
        }, forceLayout);
    }

    __getViewNameFromFilename(filename) {
        return filename.replace(config.getPath('viewsDir'), '').replace(/^[\\\/]/, '').replace(/\.\w{1,10}$/, '');
    }

    __normalizeDirectoryPath(directory) {
        if (directory.match(/\/$/)) return directory;
        return `${directory}/`;
    }

    __parseView(view, forceLayout) {
        view.data = this.__parseMetadata(view.template.match(/^---(?:.|\s)*---/), forceLayout);
        view.template = view.template.replace(/^---(?:.|\s)*---/, '').trim();

        return view;
    }

    __parseMetadata(content, forceLayout) {
        if (!content) return {};

        const meta = content[0].replace(/---/g, '').trim();
        const matches = meta.match(/.*\s?:\s?.*\s?/g);
        const data = {};
        
        matches.forEach((match) => {
            const parts = match.split(':', 2);
            data[parts[0].trim()] = parts[1].trim();
        });

        if (forceLayout) {
            data.layout = this.__getLayout(data);
        }

        return data;
    }

    __getLayout(data) {
        if ('layout' in data) {
            return data.layout;
        }
        return config.SETTINGS.defaultLayout;
    }

    async __createFileFromView(view) {
        log.status(`Compiling ${view.name}`);

        const isHomepage = view.name === 'index';
        const pathSuffix = isHomepage ? '.html' : '/index.html'
        const destinationPath = this.__getViewDestinationPath(view);
        let fullView;

        if (!('layout' in view.data)) {
            view.data.layout = config.SETTINGS.defaultLayout;
        }

        if (view.data.layout === 'none' || !this.layouts.length) {
            fullView = view.template;
        } else {
            const layoutName = path.normalize(`${config.getPath('layoutsDir').replace(config.getPath('viewsDir'), '').replace(/^[\\\/]/, '')}/${view.data.layout}`);
            console.log(layoutName);
            const layout = this.layouts.find(l => l.name === layoutName);
            fullView = layout.template.replace(config.SETTINGS.layoutReplacer, view.template);
        }

        try {
            const compiled = handlebars.compile(fullView)(view.data);
            const out = await fs.outputFile(destinationPath, minify(compiled, config.SETTINGS.minifyOptions));
        } catch(err) {
            log.error(`Error compiling ${view.name}: ${err}`);
        }
    }

    async __deleteViewFile(filename) {
        const viewName = this.__getViewNameFromFilename(filename);
        const destinationPath = this.__getViewDestinationPath(viewName);
        const destination = viewName === 'index' ? destinationPath : destinationPath.replace('/index.html', '');

        try {
            // todo: Recursively delete parent directories if empty, for nested views
            await fs.remove(destination);
        } catch(err) {
            log.error(err);
        }
    }

    __getViewDestinationPath(view) {
        const name = typeof view === 'object' ? view.name : view;
        const isHomepage = name === 'index';
        const pathSuffix = isHomepage ? '.html' : '/index.html'
        return `${config.SETTINGS.outputDir}${name}${pathSuffix}`;
    }
}

module.exports = ViewCompiler;