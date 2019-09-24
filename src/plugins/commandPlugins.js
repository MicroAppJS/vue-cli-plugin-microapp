'use strict';

const path = require('path');

module.exports = function CommandPlugins(api, vueRoot, projectOptions) {

    [
        'serve',
        'build',
        'inspect',
    ]
        .forEach(name => {

            // register
            api.registerVuePlugin({
                id: `vue-service:plugins-command-${name}`,
                link: require.resolve(path.resolve(vueRoot, 'commands', name)),
                description: `[vue-service] command - ${name}`,
            });

        });
};
