
import { describe, expect, test } from '@jest/globals';
import { calendario } from '../../../src/application/componentes/calendario.mjs';

describe('calendario', () => {

    test('data today from calendar consructor', async () => {
        const m = {
            body: {
                tipo: "actual"
            }
        }
        const response = await calendario(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('data today from calendar consructor', async () => {
        const m = {
            body: {
                tipo: "personalizado",
                mes: 1,
                ano: 2026
            }
        }
        const response = await calendario(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
