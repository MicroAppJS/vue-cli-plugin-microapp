'use strict';

/* global expect */

describe('Plugin VueCLI bin', () => {

    it('vue:serve run', async () => {
        const shelljs = require('shelljs');

        const { code, stderr } = shelljs.exec('node bin/micro-app-vue serve', {
            cwd: process.cwd(),
            timeout: 5000,
        });

        if (code && stderr) {
            throw new Error(stderr);
        }
    });

    it('vue:build run', () => {
        const shelljs = require('shelljs');

        const { code, stderr } = shelljs.exec('node bin/micro-app-vue build', {
            cwd: process.cwd(),
            timeout: 5000,
        });

        if (code && stderr) {
            throw new Error(stderr);
        }
    });

});
