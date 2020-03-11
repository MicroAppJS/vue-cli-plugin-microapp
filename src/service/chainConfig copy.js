'use strict';

const { tryRequire, path, fs } = require('@micro-app/shared-utils');

module.exports = function chainDefault(api, vueConfig, options) {

    if (options.publicPath) {
        vueConfig.publicPath = options.publicPath;
    }

    if (options.outputDir) {
        vueConfig.outputDir = options.outputDir;
    }

    if (options.assetsDir) {
        vueConfig.assetsDir = options.assetsDir;
    }

    const outputDir = api.resolve(options.outputDir);

    api.chainWebpack(webpackChain => {

        const nodeModulesPaths = options.nodeModulesPaths || [];
        webpackChain.resolve
            .set('symlinks', true)
            .modules
            .merge(nodeModulesPaths)
            .end();

        webpackChain.resolveLoader
            .set('symlinks', true)
            .modules
            .merge(nodeModulesPaths)
            .end();

        const alias = options.resolveAlias || {};
        // alias
        webpackChain.resolve
            .alias
            .merge(alias)
            .end();

        // devServer
        vueConfig.devServer = Object.assign(vueConfig.devServer || {}, options.devServer || {});

        const defaultHtmlPath = require.resolve('@vue/cli-service/lib/config/index-default.html');
        const publicCopyIgnore = [ '.DS_Store' ];

        const resolveClientEnv = require('@vue/cli-service/lib/util/resolveClientEnv');
        const htmlOptions = {
            title: api.service.pkg.name,
            templateParameters: (compilation, assets, pluginOptions) => {
                // enhance html-webpack-plugin's built in template params
                let stats;
                return Object.assign({
                    // make stats lazy as it is expensive
                    get webpack() {
                        return stats || (stats = compilation.getStats().toJson());
                    },
                    compilation,
                    webpackConfig: compilation.options,
                    htmlWebpackPlugin: {
                        files: assets,
                        options: pluginOptions,
                    },
                }, resolveClientEnv(options, true /* raw */));
            },
        };

        // pages
        const oldPages = vueConfig.pages;
        if (!oldPages) {
            // multi-page setup
            webpackChain.entryPoints.clear();

            const multiPageConfig = vueConfig.pages = options.pages;
            const pages = Object.keys(multiPageConfig);
            const normalizePageConfig = c => (typeof c === 'string' ? { entry: c } : c);

            pages.forEach(name => {
                const pageConfig = normalizePageConfig(multiPageConfig[name]);
                const {
                    entry,
                    template = `public/${name}.html`,
                    filename = `${name}.html`,
                    chunks = [ 'chunk-vendors', 'chunk-common', name ],
                } = pageConfig;

                // Currently Cypress v3.1.0 comes with a very old version of Node,
                // which does not support object rest syntax.
                // (https://github.com/cypress-io/cypress/issues/2253)
                // So here we have to extract the customHtmlOptions manually.
                const customHtmlOptions = {};
                for (const key in pageConfig) {
                    if (
                        ![ 'entry', 'template', 'filename', 'chunks' ].includes(key)
                    ) {
                        customHtmlOptions[key] = pageConfig[key];
                    }
                }

                // inject entry
                const entries = Array.isArray(entry) ? entry : [ entry ];
                webpackChain.entry(name).merge(entries.map(e => api.resolve(e)));

                // resolve page index template
                const hasDedicatedTemplate = fs.existsSync(api.resolve(template));
                const templatePath = hasDedicatedTemplate
                    ? template
                    : defaultHtmlPath;

                publicCopyIgnore.push({
                    glob: path.relative(api.resolve('public'), api.resolve(templatePath)),
                    matchBase: false,
                });

                // inject html plugin for the page
                const pageHtmlOptions = Object.assign(
                    {},
                    htmlOptions,
                    {
                        chunks,
                        template: templatePath,
                        filename: ensureRelative(outputDir, filename),
                    },
                    customHtmlOptions
                );

                const HTMLPlugin = tryRequire('html-webpack-plugin');
                if (HTMLPlugin) {
                    webpackChain
                        .plugin(`html-${name}`)
                        .use(HTMLPlugin, [ pageHtmlOptions ]);
                }
            });
        }

        console.warn(vueConfig);
        // const entry = options.entry || {};
        // // entry
        // Object.keys(entry).forEach(key => {
        //     webpackChain.entry(key).merge(entry[key]);
        // });

        const CopyWebpackPlugin = tryRequire('copy-webpack-plugin');
        if (CopyWebpackPlugin) {
            const staticPaths = options.staticPaths || [];
            // 有的时候找不到原来的 CopyWebpackPlugin，不知道为什么
            webpackChain.plugin('copy').use(CopyWebpackPlugin, [
                staticPaths.map(staticPath => {
                    return { from: staticPath, to: outputDir, ignore: publicCopyIgnore };
                }),
            ]);
        }

        return webpackChain;
    });
};

function ensureRelative(outputDir, _path) {
    if (path.isAbsolute(_path)) {
        return path.relative(outputDir, _path);
    }
    return _path;

}
