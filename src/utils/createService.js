'use strict';

const { service } = require('@micro-app/cli');
const { SKIP_CONTEXT } = require('../constants');
service.mergeContext(SKIP_CONTEXT);

// 提前注册
const registerWebpackPlugin = require('./registerWebpackPlugin');
registerWebpackPlugin(service);

module.exports = service;
