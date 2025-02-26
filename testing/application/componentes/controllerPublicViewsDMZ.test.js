
import { describe, expect, test } from '@jest/globals';
import { cambiarVista } from '../../../src/application/componentes/cambiarVista.mjs';

describe('controles public view in DMZ', () => {

    test('get data of public view', async () => {
        const m = {
            body: {
                vista: "/portada"
            }
        }
        const response = await cambiarVista(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get data of public view with error', async () => {

        try {
            const m = {
                body: {
                    vista: "/"
                }
            }
            const response = await cambiarVista(m)
            expect(response).not.toBeUndefined();
            expect(typeof response).toBe('object');
            expect(response).toHaveProperty('error');
        } catch (error) {
            expect(error).toBeInstanceOf(Object)
            expect(error.hasOwnProperty('error'))
        }

    })

})
