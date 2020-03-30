'use strict';

const chainConfig = require('./service/chainConfig');
const createService = require('./utils/createService');
const { BUILT_IN } = require('./constants');

module.exports = function(api, vueConfig) {
    const service = createService();

    // 注册插件
    service.registerPlugin({
        id: 'vue-cli-plugin:plugin-modifyVueConfig-apply',
        [BUILT_IN]: true,
        apply(_api) {
            // 修改默认配置
            _api.onInitDone(() => {
                const newVueConfig = _api.applyPluginHooks('modifyVueConfig', vueConfig);
                Object.assign(vueConfig, newVueConfig || {});
            });
        },
    });

    // 加载获取所有配置
    service.initSync();
    const config = service.config;

    return chainConfig(api, vueConfig, config);
};

// 外部服务提前注册方法
module.exports.registerMethod = require('./utils/registerMethod');
