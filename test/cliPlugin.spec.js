'use strict';

/* global expect */

describe('Vue CLI Plugin', () => {

    const plugin = require('../src');

    it('plugin', async () => {
        const api = {
            chainWebpack() {

            },
        };

        plugin(api, {});
    });

});
