'use strict';

const { service } = require('@micro-app/cli');
const { SKIP_TARGET } = require('../constants');

service.context.target = SKIP_TARGET;

// 提前注册
const registerWebpackPlugin = require('./registerWebpackPlugin');
registerWebpackPlugin(service);

module.exports = service;
