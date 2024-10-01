
import { describe, expect, test } from '@jest/globals';
import { diasOcupadosTotalmentePorMes } from '../../../src/application/componentes/diasOcupadosTotalmentePorMes.mjs';

describe('daysFullByMonth', () => {

    test('get data of public view', async () => {
        const m = {
            body: {
                mes: 1,
                ano: 2025
            }
        }
        const response = await diasOcupadosTotalmentePorMes(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


})
