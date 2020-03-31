'use strict';

const { _, logger } = require('@micro-app/shared-utils');
const { createService } = require('@micro-app/cli');
const { SKIP_TARGET, BUILT_IN } = require('../constants');

// 无日志服务
module.exports = function silentService(cb) {
    // record
    const ORIGINAL_LEVEL = logger.level;
    logger.level = 'error';

    const service = createService({ target: SKIP_TARGET });

    const WEBPACK_PLUGIN_ID = '@micro-app/plugin-webpack';
    if (!service.hasPlugin(WEBPACK_PLUGIN_ID)) {
        // 注册 webapck 插件
        service.registerPlugin({
            id: WEBPACK_PLUGIN_ID,
            [BUILT_IN]: true,
        });
    }

    const result = _.isFunction(cb) && cb(service);

    // recovery
    logger.level = ORIGINAL_LEVEL;
    return result;
};
