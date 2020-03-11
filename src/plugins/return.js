'use strict';

// 针对 vue-cli-plugin 进行适配的指令, 用于输出一些配置.
module.exports = function ReturnCommand(api, opts) {

    api.registerCommand('return-config', {
        description: 'return MicroApp config.',
        usage: 'micro-app return-config [options]',
        options: {
            '--key <name>': 'return-config <name>.',
        },
    }, args => {
        const key = args.key;
        if (key === 'config') {
            const webpackConfig = api.resolveWebpackConfig();
            return webpackConfig;
        } else if (key === 'chain') {
            const webpackChain = api.resolveChainableWebpackConfig();
            return webpackChain;
        } else if (key === 'micros') {
            return api.microsConfig;
        }
        return api.config;
    });

};
