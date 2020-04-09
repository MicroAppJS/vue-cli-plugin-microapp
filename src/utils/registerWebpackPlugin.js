'use strict';

const { BUILT_IN } = require('../constants');

module.exports = function registerWebpackPlugin(s) {
    const WEBPACK_PLUGIN_ID = '@micro-app/plugin-webpack';
    if (!s.hasPlugin(WEBPACK_PLUGIN_ID)) {
        // 注册 webapck 插件
        s.registerPlugin({
            id: WEBPACK_PLUGIN_ID,
            [BUILT_IN]: true,
        });
    }
};
