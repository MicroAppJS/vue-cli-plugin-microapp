'use strict';

/* global expect */

describe('Vue CLI Plugin', () => {

    const createService = require('../src/utils/createService');

    it('createService', async () => {
        const service = createService();

        expect(typeof service === 'object').not.toBeUndefined();

        await service.run('help');
    });

});
