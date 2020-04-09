'use strict';

const { _, logger } = require('@micro-app/shared-utils');
const { createService, service: $s } = require('@micro-app/cli');
const { SKIP_TARGET, BUILT_IN } = require('../constants');

// 提前注册
registerWebpackPlugin($s);

// 无日志服务
module.exports = function silentService(cb) {
    // record
    const ORIGINAL_LEVEL = logger.level;
    logger.level = 'silent';

    const service = createService({ target: SKIP_TARGET });
    registerWebpackPlugin(service);

    const result = _.isFunction(cb) && cb(service);

    // recovery
    logger.level = ORIGINAL_LEVEL;
    return result;
};


function registerWebpackPlugin(s) {
    const WEBPACK_PLUGIN_ID = '@micro-app/plugin-webpack';
    if (!s.hasPlugin(WEBPACK_PLUGIN_ID)) {
        // 注册 webapck 插件
        s.registerPlugin({
            id: WEBPACK_PLUGIN_ID,
            [BUILT_IN]: true,
        });
    }
}
