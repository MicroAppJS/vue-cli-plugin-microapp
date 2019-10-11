'use strict';

const virtualFile = require('@micro-app/core').virtualFile;

// 重新适配文件
module.exports = function fixedPluginFile(id, link) {
    virtualFile.register(link, content => {

        let newJsText = content
            .replace(/registerCommand/gm, 'registerVueCommand')
            .replace(new RegExp('vue-cli-service (\\w+)', 'gm'), 'micro-app-vue $1')
            .replace(new RegExp('api.service.context', 'gm'), 'api.getCwd()')
            .replace('const webpackConfig = api.resolveWebpackConfig()', [
                'const _webpackConfig = api.resolveWebpackConfig()',
                `const { webpackConfig } = api.applyPluginHooks('modifyWebpackConfig', {
                args: args,
                webpackConfig: _webpackConfig,
            });

            if (!webpackConfig) {
                api.logger.error('[Plugin] modifyWebpackConfig must return { webpackConfig }');
                return process.exit(1);
            }`,
            ].join('\n'))
        ;

        if (id === 'vue-service:plugins-command-serve') {
        // 注入事件
            newJsText = newJsText
                .replace('api.service.devServerConfigFns.forEach(fn => fn(app, server))', [
                    'const config = api.serverConfig;',
                    "api.applyPluginHooks('onServerInit', { app, server, options, config });",
                    "api.applyPluginHooks('beforeServerEntry', { app, server, options, config });",
                ].join('\n\n'))
                .replace('before (app, server) {', [
                    `after (app, server) {
                    const config = api.serverConfig;
                    api.applyPluginHooks('afterServerEntry', { app, server, options, config });
                    api.applyPluginHooks('onServerInitWillDone', { app, server, options, config });
                    api.applyPluginHooks('onServerInitDone', { app, server, options, config });
                    projectDevServerOptions.after && projectDevServerOptions.after(app, server);
                },`,
                    'before (app, server) {',
                ].join('\n'));
        }

        // TODO change module.exports.defeaultConfig


        return newJsText;
    });

    return link;
};
