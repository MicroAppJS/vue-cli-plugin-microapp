'use strict';

const chainConfig = require('./service/chainConfig');

module.exports = function(api, vueConfig) {

    const { createService } = require('@micro-app/cli');
    const service = createService();

    const builtIn = Symbol.for('built-in');

    // 注册 webapck 插件
    service.registerPlugin({
        id: '@micro-app/plugin-webpack',
        [builtIn]: true,
    });

    // 注册插件
    service.registerPlugin({
        id: 'vue-cli:plugin-command-return-config',
        link: require.resolve('./plugins/return.js'),
        [builtIn]: true,
    });

    const config = service.runSync('return-config');
    const webpackConfig = service.runSync('return-config', { _: [], key: 'config' });

    return chainConfig(api, vueConfig, config, webpackConfig);
};
