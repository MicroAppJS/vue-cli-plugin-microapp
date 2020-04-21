'use strict';

module.exports = {
    BUILT_IN: Symbol.for('built-in'),
    SKIP_CONTEXT: [ '--pure-webpack-unified-config' ], // 通过此配置，可禁用 plugin-webpack 中的默认配置
};
