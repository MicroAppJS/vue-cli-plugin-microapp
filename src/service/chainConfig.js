'use strict';

const { _, tryRequire, fs, logger } = require('@micro-app/shared-utils');

// 以 vue-cli 配置为主
module.exports = function chainDefault(api, vueConfig, _mapi) {
    const options = _mapi.config || {};

    [ // string
        'publicPath',
        'outputDir',
        'assetsDir',
    ]
        .forEach(key => {
            if (!_.isUndefined(options[key])) {
                if (_.isUndefined(vueConfig[key])) { // vueConfig 中是否已经存在配置了
                    vueConfig[key] = options[key];
                }
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

    // global save vueConfig
    _mapi.setState('vueConfig', vueConfig);

    // 补充
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

        const alias = Object.assign({}, options.resolveAlias || {});
        // alias
        webpackChain.resolve
            .alias
            .merge(alias)
            .end();

        // copy static
        const staticPaths = (options.staticPaths || []).filter(item => fs.existsSync(item));
        if (staticPaths.length) {
            const CopyWebpackPlugin = tryRequire('copy-webpack-plugin');
            if (CopyWebpackPlugin) {
                webpackChain
                    .plugin('copy')
                    .use(CopyWebpackPlugin, [ staticPaths.map(publicDir => {
                        return {
                            from: publicDir,
                            toType: 'dir',
                            ignore: [ '.*' ],
                        };
                    }) ]);
            } else {
                logger.warn('[webpack]', 'Not Found "copy-webpack-plugin"');
            }
        }

        return webpackChain;
    });

    // webpack 所有配置合入
    api.chainWebpack(webpackChain => {
        return _mapi.resolveChainableWebpackConfig(webpackChain);
    });
};
