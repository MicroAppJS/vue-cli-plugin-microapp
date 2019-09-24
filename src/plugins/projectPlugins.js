'use strict';

const { isPlugin } = require('@vue/cli-shared-utils');
const _ = require('lodash');

module.exports = function ProjectPlugins(api, vueRoot, projectOptions) {

    const projectPlugins = Object.keys(api.pkg && api.pkg.devDependencies || {})
        .concat(Object.keys(api.pkg && api.pkg.dependencies || {}))
        .filter(isPlugin)
        .map(id => {
            return id;
        });

    projectPlugins.forEach(id => {
        // register
        api.registerVuePlugin({
            id,
            description: `[vue-service] project - ${id}`,
        });
    });


    // apply webpack configs from project config file
    api.registerVuePlugin({
        id: 'vue-service:plugins-config-projectOptions',
        apply(api) {
            if (projectOptions.chainWebpack && _.isFunction(projectOptions.chainWebpack)) {
                api.chainWebpack(projectOptions.chainWebpack);
            }

            if (projectOptions.configureWebpack && _.isFunction(projectOptions.configureWebpack)) {
                api.configureWebpack(projectOptions.configureWebpack);
            }
        },
        description: '[vue-service] config projectOptions - (chainWebpack、configureWebpack)',
    });
};
