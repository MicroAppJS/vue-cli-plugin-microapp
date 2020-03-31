'use strict';

const chainConfig = require('./service/chainConfig');
const silentService = require('./utils/silentService');
const { BUILT_IN } = require('./constants');

module.exports = function(api, vueConfig) {
    if (api.__isMicroAppPluginAPI) { // micro-app plugin
        const registerMethod = require('./utils/registerMethod');
        registerMethod(api);
    } else { // vue-cli plugin
        const config = silentService(service => {
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
            return service.config;
        });

        return chainConfig(api, vueConfig, config);
    }
};
