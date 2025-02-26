
import { describe, expect, test } from '@jest/globals';
import { obtenerConfiguracion } from '../../../../src/application/administracion/configuracion/limitesReservaPublica/obtenerConfiguracion.mjs';
import { guardarConfiguracion } from '../../../../src/application/administracion/configuracion/limitesReservaPublica/guardarConfiguracion.mjs';

describe('Global limits of public bookins', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    test('get all limits for public bookins with ok', async () => {
        const makeEntity = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerConfiguracion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('update limits for public bookins with ok', async () => {
        const makeEntity = {
            body: {
                diasAntelacionReserva: "10",
                limiteFuturoReserva: "360",
                diasMaximosReserva: "30"
            },
            session: fakeAdminSession
        }
        const response = await guardarConfiguracion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
