'use strict';

const path = require('path');

module.exports = function ConfigPlugins(api, vueRoot, projectOptions) {

    [ // config plugins are order sensitive
        'base',
        'css',
        'prod',
        'app',
    ].forEach(name => {
        // register
        api.registerVuePlugin({
            id: `vue-service:plugins-config-${name}`,
            link: path.resolve(vueRoot, 'config', name),
            description: `[vue-service] config - ${name}`,
        });
    });

};
