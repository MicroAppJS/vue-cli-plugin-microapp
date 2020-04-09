'use strict';

const chainConfig = require('./service/chainConfig');
const silentService = require('./utils/silentService');
const { BUILT_IN } = require('./constants');

module.exports = function(api, vueConfig) {
    if (api.$isMicroAppPluginAPI) { // micro-app plugin
        const registerMethod = require('./utils/registerMethod');
        registerMethod(api);
        // 重写
        api.extendMethod('resolveWebpackConfig', {
            description: 'resolve webpack config.',
            override: true,
        }, webpackConfig => {
            const finalWebpackConfig = api.applyPluginHooks('modifyWebpackConfig', webpackConfig);
            api.setState('webpackConfig', finalWebpackConfig);
            return finalWebpackConfig;
        });
    } else { // vue-cli plugin
        silentService(service => {
            // 注册插件
            service.registerPlugin({
                id: 'vue-cli-plugin:plugin-modifyVueConfig-apply',
                [BUILT_IN]: true,
                apply(_api) {
                    // 修改默认配置
                    _api.onInitDone(() => {
                        const newVueConfig = _api.applyPluginHooks('modifyVueConfig', vueConfig);
                        Object.assign(vueConfig, newVueConfig || {});

                        return chainConfig(api, vueConfig, _api);
                    });
                },
            });

            // 加载获取所有配置
            return service.initSync();
        });
    }
};
