'use strict';

const { _, tryRequire, fs, logger } = require('@micro-app/shared-utils');

// 以 vue-cli 配置为主
module.exports = function chainDefault(api, vueConfig, _mapi) {
    const options = _mapi.config || {};

    if (_.isUndefined(vueConfig.filenameHashing)) {
        vueConfig.filenameHashing = true;
    }

    [ // string
        'publicPath',
        'outputDir',
        'assetsDir',
    ]
        .forEach(key => {
            if (!_.isUndefined(options[key])) { // 不兼容性修改
                vueConfig[key] = options[key];
                // delete options[key]; // 交接所有能力
                Object.defineProperty(options, key, {
                    get() {
                        return vueConfig[key];
                    },
                    set(value) {
                        vueConfig[key] = value;
                    },
                    enumerable: true,
                    configurable: true,
                });
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
                // delete options[key]; // 交接所有能力
                Object.defineProperty(options, key, {
                    get() {
                        return vueConfig[key];
                    },
                    set(value) {
                        vueConfig[key] = value;
                    },
                    enumerable: true,
                    configurable: true,
                });
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
                const outputDir = webpackChain.output.get('path');
                webpackChain
                    .plugin('copyEx')
                    .use(CopyWebpackPlugin, [ staticPaths.map(publicDir => {
                        return {
                            from: publicDir,
                            to: outputDir,
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
        return _mapi.resolveWebpackChain(webpackChain);
    });
};
