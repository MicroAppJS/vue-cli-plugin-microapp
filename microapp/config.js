'use strict';

const config = {
    type: '', // types 类型
};

if (process.env.NODE_ENV === 'test') {
    config.plugins = [
        '@micro-app/plugin-deploy', // test
    ];

    Object.assign(config, {
        entry: {
            main: './client/main.js',
        },

        // staticPath: '',

        htmls: [
            {
                filename: 'index.html',
                hash: true,
                chunks: [ 'common', 'main' ],
                template: './client/index.html',
            },
        ],
        alias: { // 前端共享
            api: './client/api.js',
            config: {
                type: 'server', // 后端共享
                link: './server/config.js',
            },
        },
    });
}

module.exports = config;
