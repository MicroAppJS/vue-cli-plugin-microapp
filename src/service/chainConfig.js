'use strict';

const { tryRequire } = require('@micro-app/shared-utils');

module.exports = function chainDefault(api, vueConfig, options, webpackConfig) {
    const webpackConfigAlias = webpackConfig.module.alias || {};

    [
        'publicPath',
        'outputDir',
        'assetsDir',
    ]
        .forEach(key => {
            if (options[key] !== undefined) {
                vueConfig[key] = options[key];
            }
        });

    // devServer
    vueConfig.devServer = Object.assign({}, vueConfig.devServer || {}, options.devServer || {});

    // pages
    vueConfig.pages = Object.assign({}, vueConfig.pages || {}, options.pages || {});

    // css
    vueConfig.css = Object.assign({}, vueConfig.css || {}, options.css || {});

    api.chainWebpack(webpackChain => {
        const outputDir = api.resolve(options.outputDir);

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

        const alias = Object.assign({}, options.resolveAlias || {}, webpackConfigAlias);
        // alias
        webpackChain.resolve
            .alias
            .merge(alias)
            .end();

        // const entry = options.entry || {};
        // // entry
        // Object.keys(entry).forEach(key => {
        //     webpackChain.entry(key).merge(entry[key]);
        // });

        const CopyWebpackPlugin = tryRequire('copy-webpack-plugin');
        if (CopyWebpackPlugin) {
            const staticPaths = options.staticPaths || [];
            // 有的时候找不到原来的 CopyWebpackPlugin，不知道为什么
            webpackChain.plugin('copyEx').use(CopyWebpackPlugin, [
                staticPaths.map(staticPath => {
                    return { from: staticPath, to: outputDir, ignore: [ '.*' ] };
                }),
            ]);
        }

        return webpackChain;
    });
};
