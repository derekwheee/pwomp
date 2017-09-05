var promisify = require('promisify-node');
const fs = require('fs-extra');
const glob = promisify('glob')
const handlebars = require('handlebars');
const minify = require('html-minifier').minify;
const config = require('../config.js');
const log = require('../log.js');

class ViewCompiler {
    constructor() {
        this.isReady = false;
        this.queue = [];

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
        const rawViews = await this.__dirContentsToObject(config.SETTINGS.viewsDir, ignore);
        return this.__parseViews(rawViews);
    }

    async __dirContentsToObject(directory, ignore) {
        
        try {
            const filenames = await glob(`${directory}**/*.${config.SETTINGS.viewExtension}`, { ignore : ignore ? `{${ignore.join(',')}}/**` : null });
            return await Promise.all(filenames.map(async (filename) => {
                const content = await fs.readFile(filename, 'utf-8');
                return {
                    name : filename.replace(/\.\w{1,10}$/, '').replace(directory, ''),
                    template : content,
                };
            }));
        } catch (err) {
            log.error(err);
        }
    }

    __parseViews(views) {
        return views.map((view) => {
            view.data = this.__parseMetadata(view.template.match(/^---(?:.|\s)*---/));
            view.template = view.template.replace(/^---(?:.|\s)*---/, '').trim();
            return view;
        });
    }

    __parseMetadata(content) {
        if (!content.length) return {};

        const meta = content[0].replace(/---/g, '').trim();
        const matches = meta.match(/.*\s?:\s?.*\s?/g);
        const data = {};
        
        matches.forEach((match) => {
            const parts = match.split(':', 2);
            data[parts[0].trim()] = parts[1].trim();
        });

        return data;
    }

    async __createFileFromView(view) {
        log.status(`Compiling ${view.name}`);

        const isHomepage = view.name.replace(config.SETTINGS.viewsDir, '') === 'index';
        const pathSuffix = isHomepage ? '.html' : '/index.html'
        const destinationPath = `${config.SETTINGS.outputDir}${view.name.replace(config.SETTINGS.viewsDir, '')}${pathSuffix}`;
        let fullView;

        if (!('layout' in view.data)) {
            view.data.layout = config.SETTINGS.defaultLayout;
        }

        if (view.data.layout === 'none') {
            fullView = view.template;
        } else {
            const layout = this.layouts.find(l => l.name === view.data.layout);
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