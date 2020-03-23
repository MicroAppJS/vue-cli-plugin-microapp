'use strict';

/* global expect */

describe('Vue CLI Plugin', () => {

    const createService = require('../src/utils/createService');

    it('createService', async () => {
        const service = createService();

        expect(typeof service === 'object').toBeTruthy();

        await service.run('help');
    });

    it('getConfig', () => {
        const service = createService();

        // 加载获取所有配置
        service.initSync();
        const config = service.config;

        expect(typeof config === 'object').toBeTruthy();

        console.warn('config:', config);
    });

});
