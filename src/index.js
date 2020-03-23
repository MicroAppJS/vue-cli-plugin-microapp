'use strict';

const chainConfig = require('./service/chainConfig');
const createService = require('./utils/createService');

module.exports = function(api, vueConfig) {
    const service = createService();

    // 加载获取所有配置
    service.initSync();
    const config = service.config;

    return chainConfig(api, vueConfig, config);
};
