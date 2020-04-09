'use strict';

const chainConfig = require('./service/chainConfig');
const service = require('./utils/createService');

let IPLUGIN_ID;
module.exports = function(api, vueConfig) {
    if (api.$isMicroAppPluginAPI) { // micro-app plugin
        const registerMethod = require('./utils/registerMethod');
        registerMethod(api);
        IPLUGIN_ID = api.id;
    } else { // vue-cli plugin
        const plugin = IPLUGIN_ID ? service.findPlugin(IPLUGIN_ID) : service.plugins[0]; // 随便取个plugin
        const _mapi = plugin[Symbol.for('api')];

        // 重写 resolveWebpackConfig
        _mapi.extendMethod('resolveWebpackConfig', {
            description: 'resolve webpack config.',
            override: true,
        }, webpackConfig => {
            const finalWebpackConfig = _mapi.applyPluginHooks('modifyWebpackConfig', webpackConfig);
            _mapi.setState('webpackConfig', finalWebpackConfig);
            return finalWebpackConfig;
        });

        // 修改默认配置
        const newVueConfig = _mapi.applyPluginHooks('modifyVueConfig', vueConfig);
        Object.assign(vueConfig, newVueConfig || {});

        chainConfig(api, vueConfig, _mapi);

        // 覆盖逻辑
        const originaFn = api.resolveWebpackConfig;
        api.resolveWebpackConfig = function(chainableConfig) {
            return _mapi.resolveWebpackConfig(originaFn.apply(api, chainableConfig));
        };
    }
};
