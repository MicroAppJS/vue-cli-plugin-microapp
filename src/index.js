'use strict';

const chainConfig = require('./service/chainConfig');
const service = require('./utils/createService');

let IPLUGIN_ID;
module.exports = function(api, vueConfig) {
    if (api.$isMicroAppPluginAPI) { // micro-app plugin
        IPLUGIN_ID = api.id;
    } else { // vue-cli plugin
        const plugin = IPLUGIN_ID ? service.findPlugin(IPLUGIN_ID) : service.plugins[0]; // 随便取个plugin
        const _mapi = plugin[Symbol.for('api')];

        if (!_mapi) {
            const { logger } = require('@micro-app/shared-utils');
            return logger.error('[Vue-CLI-Plugin]', 'Not Found "api"!');
        }

        // 重写 resolveWebpackConfig
        _mapi.extendMethod('resolveWebpackConfig', {
            description: 'resolve webpack config.',
            override: true,
        }, webpackConfig => {
            const finalWebpackConfig = _mapi.applyPluginHooks('modifyWebpackConfig', webpackConfig);
            _mapi.setState('webpackConfig', finalWebpackConfig);
            return finalWebpackConfig;
        });

        // 修改补充一些默认值
        chainConfig(api, vueConfig, _mapi);

        // 修改默认配置
        const newVueConfig = _mapi.applyPluginHooks('modifyVueConfig', vueConfig);
        Object.assign(vueConfig, newVueConfig || {});

        // 覆盖逻辑
        const _service = api.service;
        if (_service) {
            const originaFn = _service.resolveWebpackConfig;
            _service.resolveWebpackConfig = function(chainableConfig) {
                return _mapi.resolveWebpackConfig(originaFn.call(_service, chainableConfig));
            };
        }
    }
};

// 注册
module.exports.registerMethod = {
    modifyVueConfig: {
        type: 'MODIFY',
        description: 'modify vue config.',
    },
};
