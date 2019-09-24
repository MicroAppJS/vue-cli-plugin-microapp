'use strict';

module.exports = {
    // pages: {
    //     app: 'test/main.js',
    // },
    chainWebpack: config => {
        config.entry('app').clear();
        config.entryPoints.delete('app');
    },
};
