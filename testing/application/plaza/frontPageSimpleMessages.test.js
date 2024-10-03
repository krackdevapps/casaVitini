
import { describe, expect, test } from '@jest/globals';
import { obtenerMensajes } from '../../../src/application/plaza/portada/obtenerMensajes.mjs';

describe('frontPageSimpleMessages DMZ', () => {
    test('get front page messages in DMS', async () => {
        const response = await obtenerMensajes()
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
})
