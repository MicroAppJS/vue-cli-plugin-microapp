'use strict';

/* global expect */

const path = require('path');

describe('Plugin VueCLIAdapter', () => {

    it('VueCLIAdapter', async () => {
        const { service } = require('@micro-app/cli/bin/base');
        // service.registerPlugin({
        //     id: '@micro-app/plugin-webpack-adapter',
        // });
        // service.registerPlugin({
        //     id: 'test:VueCLIAdapter',
        //     link: path.join(__dirname, './index.js'),
        // });

        await service.run('help', { _: [] });
    });

    it('resolveWebpackConfig', async () => {
        const { service } = require('@micro-app/cli/bin/base');
        // service.registerPlugin({
        //     id: '@micro-app/plugin-webpack-adapter',
        // });
        // service.registerPlugin({
        //     id: 'test:VueCLIAdapter',
        //     link: path.join(__dirname, './index.js'),
        // });
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

        await service.run('help', { _: [] });
    });

    it('vue:serve', async () => {
        const { service } = require('@micro-app/cli/bin/base');
        // service.registerPlugin({
        //     id: '@micro-app/plugin-webpack-adapter',
        // });
        // service.registerPlugin({
        //     id: 'test:VueCLIAdapter',
        //     link: path.join(__dirname, './index.js'),
        // });

        // service.run('vue-service-serve', { _: [] });
        await service.run('help', { _: [ 'vue-service-serve' ] });
    });

    it('vue:build', async () => {
        const { service } = require('@micro-app/cli/bin/base');
        // service.registerPlugin({
        //     id: '@micro-app/plugin-webpack-adapter',
        // });
        // service.registerPlugin({
        //     id: 'test:VueCLIAdapter',
        //     link: path.join(__dirname, './index.js'),
        // });

        // service.run('vue-service-build', { _: [] });
        await service.run('help', { _: [ 'vue-service-build' ] });
    });

    it('vue:inspect', async () => {
        const { service } = require('@micro-app/cli/bin/base');
        // service.registerPlugin({
        //     id: '@micro-app/plugin-webpack-adapter',
        // });
        // service.registerPlugin({
        //     id: 'test:VueCLIAdapter',
        //     link: path.join(__dirname, './index.js'),
        // });

        await service.run('vue-service-inspect', { _: [] });
    });

});
