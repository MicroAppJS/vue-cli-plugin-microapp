'use strict';

const path = require('path');

module.exports = function CommandPlugins(api, vueRoot, projectOptions) {

    return [
        'serve',
        'build',
        'inspect',
    ].forEach(name => {

        // register
        api.registerVuePlugin({
            id: `vue-service:plugin-command-${name}`,
            link: require.resolve(path.resolve(vueRoot, 'commands', name)),
            description: `[vue-service] command - ${name}`,
        });

    });
};
