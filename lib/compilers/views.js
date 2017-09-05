const promisify = require('promisify-node');
const chokidar = require('chokidar');const fs = require('fs-extra');
const equal = require('deep-equal');
const glob = promisify('glob')
const handlebars = require('handlebars');
const minify = require('html-minifier').minify;
const config = require('../config.js');
const log = require('../log.js');

class ViewCompiler {
    constructor() {
        this.isReady = false;
        this.queue = [];

        this.__layoutPrefix = config.SETTINGS.layoutsDir.replace(config.SETTINGS.viewsDir, '')
        this.__partialPrefix = config.SETTINGS.partialsDir.replace(config.SETTINGS.viewsDir, '')

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

        const watcher = chokidar.watch(config.SETTINGS.viewsDir, {
            awaitWriteFinish : {
                stabilityThreshold: 100,
                pollInterval: 100
            }
        });

        this.compile();

        watcher.on('add', handleChange.bind(this));
        watcher.on('change', handleChange.bind(this));

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

    }

    async __init() {
        this.layouts = await this.__getLayouts();
        this.partials = await this.__getPartials();
        this.views = await this.__getViews();

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
        return await this.__dirContentsToObject(config.SETTINGS.layoutsDir);
    }

    async __getPartials() {
        return await this.__dirContentsToObject(config.SETTINGS.partialsDir);
    }

    async __getViews() {
        const ignore = [
            config.SETTINGS.layoutsDir,
            config.SETTINGS.partialsDir,
        ];
        return await this.__dirContentsToObject(config.SETTINGS.viewsDir, ignore);
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
        const path = this.__normalizePath(filename);
        const content = await fs.readFile(path, 'utf-8');
        return this.__parseView({
            name : path.replace(/\.\w{1,10}$/, '').replace(config.SETTINGS.viewsDir, ''),
            template : content,
        }, forceLayout);
    }

    __normalizePath(path) {
        path = path.replace(/\\/g, '/')

        if (path.match(/^\w/)) {
            path = `./${path}`;
        }

        if (path.match(/^\//)) {
            path = `.${path}`;
        }

        return path;
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
        const destinationPath = `${config.SETTINGS.outputDir}${view.name}${pathSuffix}`;
        let fullView;

        if (!('layout' in view.data)) {
            view.data.layout = config.SETTINGS.defaultLayout;
        }

        if (view.data.layout === 'none') {
            fullView = view.template;
        } else {
            const layoutName = `${config.SETTINGS.layoutsDir.replace(config.SETTINGS.viewsDir, '')}${view.data.layout}`
            const layout = this.layouts.find(l => l.name === layoutName);
            fullView = layout.template.replace(config.SETTINGS.layoutReplacer, view.template);
        }
        
        const compiled = handlebars.compile(fullView)(view.data);

        try {
            const out = await fs.outputFile(destinationPath, minify(compiled, config.SETTINGS.minifyOptions));
        } catch(err) {
            log.error(err);
        }
    }
}

module.exports = ViewCompiler;