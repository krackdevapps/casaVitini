
import { describe, expect, test } from '@jest/globals';
import { fechaLocal } from '../../../logica/zonas/componentes/fechaLocal.mjs';

describe('local date', () => {

    test('get data of public view', async () => {
        const m = {
            body: {}
        }
        const response = await fechaLocal(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


})
