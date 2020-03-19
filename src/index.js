'use strict';

const chainConfig = require('./service/chainConfig');
const createService = require('./utils/createService');
const CONSTANTS = require('./constants');

module.exports = function(api, vueConfig) {
    const service = createService();

    // 注册插件
    service.registerPlugin({
        id: 'vue-cli-plugin:plugin-command-return-config',
        [CONSTANTS.builtIn]: true,
        apply(_api) {
            _api.registerCommand('return-config', {
                description: 'return config of MicroApp.',
                usage: 'micro-app return-config',
            }, () => {
                return _api.config;
            });
        },
    });

    // 第一次加载所有配置
    const config = service.runSync('return-config', { _: [], target: CONSTANTS.skipTarget });

    return chainConfig(api, vueConfig, config);
};
