'use strict';

/* global expect */

describe('Vue CLI Plugin', () => {

    const silentService = require('../src/utils/silentService');

    it('silentService', async () => {
        const result = await silentService(async service => {
            expect(typeof service === 'object').toBeTruthy();

            await service.run('help');

            return true;
        });
        expect(result).toBeTruthy();
    });

    it('getConfig', () => {
        const config = silentService(service => {
        // 加载获取所有配置
            service.initSync();
            return service.config;
        });

        expect(typeof config === 'object').toBeTruthy();

        console.warn('config:', config);
    });

});
