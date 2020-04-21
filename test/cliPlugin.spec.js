'use strict';

/* global expect */

describe('Vue CLI Plugin', () => {

    const plugin = require('../src');

    it('plugin', () => {
        const api = {
            service: {
                plugins: [],
            },
            chainWebpack() {

            },
            extendMethod() {

            },
        };

        plugin(api, {});
    });

});
