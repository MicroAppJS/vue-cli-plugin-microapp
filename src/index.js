'use strict';

const path = require('path');

module.exports = function VueCLIAdapter(api, opts = {}) {

    // api.assertVersion('>=0.1.4');

    // commands
    require('./commands/version')(api);

    // Current working directory.
    api.extendMethod('getCwd', {
        description: 'Current working directory.',
    }, () => {
        return opts.root || api.root;
    });

    /**
     * Resolve path for a project.
     *
     * @param {string} _path - Relative path from project root
     * @return {string} The resolved absolute path.
     */
    api.extendMethod('resolve', {
        description: 'Resolve path for a project.',
    }, _path => {
        const context = api.getCwd();
        return path.resolve(context, _path);
    });

    api.registerMethod('chainWebpack', {
        type: api.API_TYPE.EVENT,
        description: '适配 vue-cli 中 chainWebpack 事件',
    });
    api.registerMethod('configureWebpack', {
        type: api.API_TYPE.MODIFY,
        description: '适配 vue-cli 中 configureWebpack 事件, 需要返回值',
    });
    api.registerMethod('configureDevServer', {
        type: api.API_TYPE.EVENT,
        description: '适配 vue-cli 中 configureDevServer 事件',
    });

    api.modifyChainWebpcakConfig(config => {
        api.applyPluginHooks('chainWebpack', config);
        return config;
    });

    api.modifyWebpcakConfig(config => {
        return api.applyPluginHooks('configureWebpack', config);
    });

    const buildInPlugins = require('./buildInPlugins.js');
    buildInPlugins(api, opts);
};

module.exports.configuration = {
    description: '针对 Vue Cli 适配器',
};
