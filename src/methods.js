'use strict';

const assert = require('assert');
const fs = require('fs');

module.exports = function Methods(api, projectOptions) {

    // 针对 vue plugin 的注册
    api.extendMethod('registerVuePlugin', options => {
        const { id, opts = {}, link, apply } = options;
        assert(id, 'id must supplied');
        assert(typeof id === 'string', 'id must be string');
        try {
            if (!link && !apply) {
            // fixed vue plugin
                options.link = fixedPluginFile(id, require.resolve(id));
            } else if (link) {
                options.link = fixedPluginFile(id, require.resolve(link));
            }
        } catch (error) {
            api.logger.warn('[Plugin] registerVuePlugin(): ', error);
        }
        api.registerPlugin({
            ...options,
            id: `vue-service:plugins-${id}`,
            opts: Object.assign({}, projectOptions, opts), // vue.config.js
        });
    }, {
        description: '针对 vue-cli plugin 的注册方法.',
    });

    api.extendMethod('registerVueCommand', (name, opts, fn) => {
        assert(name, 'name must supplied');
        assert(typeof name === 'string', 'name must be string');
        switch (name) {
            case 'serve': {
                const tempFn = fn;
                fn = async function(args) {
                    // beforeDevServer
                    api.applyPluginHooks('beforeDevServer', { args });

                    if (tempFn) {
                        try {
                            await tempFn(args);
                        } catch (err) {
                            api.logger.error(err);
                            api.applyPluginHooks('afterDevServer', { args, err });
                            process.exit(1);
                        }
                    }

                    // afterDevServer
                    api.applyPluginHooks('afterDevServer', { args });
                };
                break;
            }
            case 'build': {
                const tempFn = fn;
                fn = async function(args) {
                    // beforeBuild
                    api.applyPluginHooks('beforeBuild', { args });

                    if (tempFn) {
                        try {
                            await tempFn(args);
                            api.applyPluginHooks('onBuildSuccess', { args });
                        } catch (err) {
                            api.logger.error(err);
                            api.applyPluginHooks('onBuildFail', { args, err });
                            process.exit(1);
                        }
                    }

                    // afterBuild
                    api.applyPluginHooks('afterBuild', { args });
                };
                break;
            }
            default:
                break;
        }
        api.registerCommand(`vue-service-${name}`, opts, fn);
    }, {
        description: '针对 vue-cli command 的注册方法.',
    });

};

// 重新适配文件
function fixedPluginFile(id, link) {
    const newLink = link.replace(/\.js$/ig, '-for-micro-app.js');
    const jsText = fs.readFileSync(require.resolve(link), 'utf8');
    let newJsText = jsText
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
                    api.applyPluginHooks('onServerInitDone', { app, server, options, config });
                    projectDevServerOptions.after && projectDevServerOptions.after(app, server);
                },`,
                'before (app, server) {',
            ].join('\n'));
    }


    // TODO change module.exports.defeaultConfig

    fs.writeFileSync(newLink, newJsText, 'utf8');

    return newLink;
}
