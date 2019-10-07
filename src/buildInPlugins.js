'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const chalk = require('chalk');

const { defaults, validate } = require('@vue/cli-service/lib/options');

module.exports = function(api, opts = {}) {

    const logger = api.logger;

    // load user config
    const userOptions = loadUserOptions(api, opts);
    const defaultsDeep = require('lodash.defaultsdeep');
    const projectOptions = defaultsDeep(userOptions, defaults());

    logger.debug('[vue:project-config]', projectOptions);

    /**
     * Generate a cache identifier from a number of variables
     */
    api.extendMethod('genCacheConfig', {
        description: 'Generate a cache identifier from a number of variables',
    }, (id, partialIdentifier, configFiles = []) => {
        const fs = require('fs');
        const cacheDirectory = api.resolve(`node_modules/.cache/${id}`);

        // replace \r\n to \n generate consistent hash
        const fmtFunc = conf => {
            if (typeof conf === 'function') {
                return conf.toString().replace(/\r\n?/g, '\n');
            }
            return conf;
        };

        const variables = {
            partialIdentifier,
            'cli-service': require('../package.json').version,
            'cache-loader': require('cache-loader/package.json').version,
            env: process.env.NODE_ENV,
            test: !!process.env.VUE_CLI_TEST,
            config: [
                fmtFunc(projectOptions.chainWebpack),
                fmtFunc(projectOptions.configureWebpack),
            ],
        };

        if (!Array.isArray(configFiles)) {
            configFiles = [ configFiles ];
        }
        configFiles = configFiles.concat([
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
        ]);

        const readConfig = file => {
            const absolutePath = api.resolve(file);
            if (!fs.existsSync(absolutePath)) {
                return;
            }

            if (absolutePath.endsWith('.js')) {
                // should evaluate config scripts to reflect environment variable changes
                try {
                    return JSON.stringify(require(absolutePath));
                } catch (e) {
                    return fs.readFileSync(absolutePath, 'utf-8');
                }
            } else {
                return fs.readFileSync(absolutePath, 'utf-8');
            }
        };

        for (const file of configFiles) {
            const content = readConfig(file);
            if (content) {
                variables.configFiles = content.replace(/\r\n?/g, '\n');
                break;
            }
        }

        const hash = require('hash-sum');
        const cacheIdentifier = hash(variables);
        return { cacheDirectory, cacheIdentifier };
    });

    require('./methods.js')(api, projectOptions);

    const vueRoot = path.dirname(require.resolve('@vue/cli-service'));

    require('./plugins/commandPlugins.js')(api, vueRoot, projectOptions);
    require('./plugins/configPlugins.js')(api, vueRoot, projectOptions);
    require('./plugins/projectPlugins.js')(api, vueRoot, projectOptions);
};

function loadUserOptions(api, opts) {
    const logger = api.logger;

    // vue.config.js
    let fileConfig,
        pkgConfig,
        resolved,
        resolvedFrom;

    const configPath = (
        process.env.VUE_CLI_SERVICE_CONFIG_PATH || path.resolve(api.getCwd(), 'vue.config.js')
    );
    if (fs.existsSync(configPath)) {
        try {
            fileConfig = require(configPath);

            if (typeof fileConfig === 'function') {
                fileConfig = fileConfig();
            }

            if (!fileConfig || typeof fileConfig !== 'object') {
                logger.error(
                    `Error loading ${chalk.bold('vue.config.js')}: should export an object or a function that returns object.`
                );
                fileConfig = null;
            }
        } catch (e) {
            logger.error(`Error loading ${chalk.bold('vue.config.js')}:`);
            throw e;
        }
    }

    // package.vue
    pkgConfig = api.pkg && api.pkg.vue;
    if (pkgConfig && typeof pkgConfig !== 'object') {
        logger.error(
            `Error loading vue-cli config in ${chalk.bold('package.json')}: ` +
        'the "vue" field should be an object.'
        );
        pkgConfig = null;
    }

    if (fileConfig) {
        if (pkgConfig) {
            logger.warn(
                '"vue" field in package.json ignored ' +
          `due to presence of ${chalk.bold('vue.config.js')}.`
            );
            logger.warn(
                `You should migrate it into ${chalk.bold('vue.config.js')} ` +
          'and remove it from package.json.'
            );
        }
        resolved = fileConfig;
        resolvedFrom = 'vue.config.js';
    } else if (pkgConfig) {
        resolved = pkgConfig;
        resolvedFrom = '"vue" field in package.json';
    } else {
        resolved = opts.inlineOptions || {};
        resolvedFrom = 'inline options';
    }

    if (resolved.css && typeof resolved.css.modules !== 'undefined') {
        if (typeof resolved.css.requireModuleExtension !== 'undefined') {
            logger.warn(
                `You have set both "css.modules" and "css.requireModuleExtension" in ${chalk.bold('vue.config.js')}, ` +
          '"css.modules" will be ignored in favor of "css.requireModuleExtension".'
            );
        } else {
            logger.warn(
                `"css.modules" option in ${chalk.bold('vue.config.js')} ` +
          'is deprecated now, please use "css.requireModuleExtension" instead.'
            );
            resolved.css.requireModuleExtension = !resolved.css.modules;
        }
    }

    // normalize some options
    ensureSlash(resolved, 'publicPath');
    if (typeof resolved.publicPath === 'string') {
        resolved.publicPath = resolved.publicPath.replace(/^\.\//, '');
    }
    removeSlash(resolved, 'outputDir');

    // validate options
    validate(resolved, msg => {
        logger.error(
            `Invalid options in ${chalk.bold(resolvedFrom)}: ${msg}`
        );
    });

    return resolved;
}

function ensureSlash(config, key) {
    let val = config[key];
    if (typeof val === 'string') {
        if (!/^https?:/.test(val)) {
            val = val.replace(/^([^/.])/, '/$1');
        }
        config[key] = val.replace(/([^/])$/, '$1/');
    }
}

function removeSlash(config, key) {
    if (typeof config[key] === 'string') {
        config[key] = config[key].replace(/\/$/g, '');
    }
}
