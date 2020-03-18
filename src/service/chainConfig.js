'use strict';

const { _, tryRequire } = require('@micro-app/shared-utils');

// 以 vue-cli 配置为主
module.exports = function chainDefault(api, vueConfig, options, webpackConfig) {
    const webpackConfigAlias = webpackConfig.resolve.alias || {};

    [ // string
        'publicPath',
        'outputDir',
        'assetsDir',
    ]
        .forEach(key => {
            if (!_.isUndefined(options[key])) {
                vueConfig[key] = options[key];
            }
        });

    [ // object
        'devServer',
        'pages',
        'css',
    ]
        .forEach(key => {
            if (!_.isEmpty(options[key]) && !_.isUndefined(options[key])) {
                vueConfig[key] = Object.assign({}, vueConfig[key] || {}, options[key] || {});
            }
        });

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
