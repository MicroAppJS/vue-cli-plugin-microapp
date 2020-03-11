'use strict';

/* global expect */

describe('Vue CLI Plugin', () => {

    it('plugin', async () => {
        const plugin = require('../src');

        const api = {
            chainWebpack() {

            },
        };

        plugin(api, {});
    });

});
