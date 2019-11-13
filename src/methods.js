'use strict';

const assert = require('assert');

module.exports = function Methods(api, projectOptions) {

    const fixedPluginFile = require('./utils/fixedPluginFile.js');

    // 针对 vue plugin 的注册
    api.extendMethod('registerVuePlugin', {
        description: '针对 vue-cli plugin 的注册方法.',
    }, function(options) {
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
            id: `vue-service:plugin-${id}`,
            opts: Object.assign({}, projectOptions, opts), // vue.config.js
        });
    });

    api.extendMethod('registerVueCommand', {
        description: '针对 vue-cli command 的注册方法.',
    }, function(name, opts, fn) {
        assert(name, 'name must supplied');
        assert(typeof name === 'string', 'name must be string');
        let tempFn = fn;
        switch (name) {
            case 'serve': {
                tempFn = async function(args) {
                    // beforeDevServer
                    api.applyPluginHooks('beforeDevServer', { args });

                    if (fn) {
                        try {
                            await fn.call(this, args);
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
                tempFn = async function(args) {
                    // beforeBuild
                    api.applyPluginHooks('beforeBuild', { args });

                    if (fn) {
                        try {
                            await fn.call(this, args);
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
        api.registerCommand(`vue-service-${name}`, opts, tempFn);
    });

};

