'use strict';

const { createService } = require('@micro-app/cli');
const CONSTANTS = require('../constants');

module.exports = function() {
    const service = createService();

    const webpackPluginId = '@micro-app/plugin-webpack';
    if (!service.hasPlugin(webpackPluginId)) {
        // 注册 webapck 插件
        service.registerPlugin({
            id: webpackPluginId,
            [CONSTANTS.builtIn]: true,
        });
    }

    return service;
};
