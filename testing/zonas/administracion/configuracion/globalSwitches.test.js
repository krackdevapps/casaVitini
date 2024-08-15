
import { describe, expect, test } from '@jest/globals';
import { actualizarEstado } from '../../../../logica/zonas/administracion/configuracion/interruptores/actualizarEstado.mjs';
import { obtenerInterruptores } from '../../../../logica/zonas/administracion/configuracion/interruptores/obtenerInterruptores.mjs';

describe('global swtiches', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    test('get all swiches status with ok', async () => {
        const makeEntity = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerInterruptores(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('update switch with ok', async () => {
        const makeEntity = {
            body: {
                interruptorIDV: "aceptarReservasPublicas",
                estado: "activado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstado(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
