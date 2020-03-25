'use strict';

const { createService } = require('@micro-app/cli');
const { SKIP_TARGET, BUILT_IN } = require('../constants');

module.exports = function() {
    const service = createService({ target: SKIP_TARGET });

    const WEBPACK_PLUGIN_ID = '@micro-app/plugin-webpack';
    if (!service.hasPlugin(WEBPACK_PLUGIN_ID)) {
        // 注册 webapck 插件
        service.registerPlugin({
            id: WEBPACK_PLUGIN_ID,
            [BUILT_IN]: true,
        });
    }

    const PLUGIN_CHANGE_VUE_CONFIG_ID = 'vue-cli-plugin:plugin-modifyVueConfig-register';
    if (!service.hasPlugin(PLUGIN_CHANGE_VUE_CONFIG_ID)) {
        service.registerPlugin({
            id: PLUGIN_CHANGE_VUE_CONFIG_ID,
            [BUILT_IN]: true,
            apply(_api) {
                _api.registerMethod('modifyVueConfig', {
                    type: _api.API_TYPE.MODIFY,
                    description: 'modify vue config.',
                });
            },
        });
    }

    return service;
};
