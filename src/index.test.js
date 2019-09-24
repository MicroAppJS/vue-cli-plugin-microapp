'use strict';

/* global expect */

const path = require('path');

describe('Plugin VueCLIAdapter', () => {

    it('VueCLIAdapter', () => {
        const { service } = require('@micro-app/cli/bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:VueCLIAdapter',
            link: path.join(__dirname, './index.js'),
        });

        service.run('help', { _: [] });
    });

    it('resolveWebpackConfig', () => {
        const { service } = require('@micro-app/cli/bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:VueCLIAdapter',
            link: path.join(__dirname, './index.js'),
        });
        service.registerPlugin({
            id: 'test:print',
            apply(api) {
                // const logger = api.logger;
                api.onInitDone(() => {
                    const config = api.resolveWebpackConfig();
                    console.log(config);
                });
            },
        });

        service.run('help', { _: [] });
    });

    it('vue:serve', () => {
        const { service } = require('@micro-app/cli/bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:VueCLIAdapter',
            link: path.join(__dirname, './index.js'),
        });

        // service.run('vue-service-serve', { _: [] });
        service.run('help', { _: [ 'vue-service-serve' ] });
    });

    it('vue:build', () => {
        const { service } = require('@micro-app/cli/bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:VueCLIAdapter',
            link: path.join(__dirname, './index.js'),
        });

        // service.run('vue-service-build', { _: [] });
        service.run('help', { _: [ 'vue-service-build' ] });
    });

    it('vue:inspect', () => {
        const { service } = require('@micro-app/cli/bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:VueCLIAdapter',
            link: path.join(__dirname, './index.js'),
        });

        service.run('vue-service-inspect', { _: [] });
    });

});
