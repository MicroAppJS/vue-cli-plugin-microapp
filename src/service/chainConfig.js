'use strict';

const { _, tryRequire, fs, logger } = require('@micro-app/shared-utils');
const silentService = require('../utils/silentService');
const { BUILT_IN } = require('../constants');

// 以 vue-cli 配置为主
module.exports = function chainDefault(api, vueConfig, options) {

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

    let isOnce = false;
    // webpack 所有配置合入
    api.chainWebpack(webpackChain => {
        return silentService(service => {
            // 注册插件
            service.registerPlugin({
                id: 'vue-cli-plugin:plugin-command-return-webpack-chain',
                [BUILT_IN]: true,
                apply(_api) {
                    _api.registerCommand('return-webpack-chain', {
                        description: 'return config of webpack-chain.',
                        usage: 'micro-app return-webpack-chain',
                    }, () => {
                        // global save vueConfig
                        _api.setState('vueConfig', vueConfig);
                        _api.resolveChainableWebpackConfig(webpackChain);

                        if (!isOnce) {
                            isOnce = true;
                            // 覆盖逻辑
                            const originaFn = api.service.resolveWebpackConfig;
                            api.service.resolveWebpackConfig = function(chainableConfig) {
                                const webpackConfig = originaFn.apply(api.service, chainableConfig);
                                const finalWebpackConfig = _api.applyPluginHooks('modifyWebpackConfig', webpackConfig);
                                _api.setState('webpackConfig', finalWebpackConfig);
                                return finalWebpackConfig;
                            };
                        }
                    });
                },
            });

            // 同步扩充 webpack-chain config
            return service.runSync('return-webpack-chain');
        });
    });
};
