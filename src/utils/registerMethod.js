'use strict';

const { assert, logger } = require('@micro-app/shared-utils');
const { CONSTANTS } = require('@micro-app/core');
const KEY = 'modifyVueConfig';

// 注册全局, hacker, 外部调用
module.exports = function registerMethod(s) {
    assert(s, 'service or api must be required!');
    if (!s.hasKey(KEY)) {
        s.registerMethod(KEY, {
            type: CONSTANTS.API_TYPE.MODIFY,
            description: 'modify vue config.',
        });
    } else {
        logger.error(`[${KEY}]`, 'has exists.');
    }
};
