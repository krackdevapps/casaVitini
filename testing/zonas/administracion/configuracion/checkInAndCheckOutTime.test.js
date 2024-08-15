
import { describe, expect, test } from '@jest/globals';
import { obtenerConfiguracion } from '../../../../logica/zonas/administracion/configuracion/horaDeEntradaSalida/obtenerConfiguracion.mjs';
import { guardarConfiguracion } from '../../../../logica/zonas/administracion/configuracion/horaDeEntradaSalida/guardarConfiguracion.mjs';

describe('Check-In and check-out time', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    test('get all hour with ok', async () => {
        const makeEntity = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerConfiguracion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('update hour with ok', async () => {
        const makeEntity = {
            body: {
                horaEntradaTZ: "12:00",
                horaSalidaTZ: "11:00"
            },
            session: fakeAdminSession
        }
        const response = await guardarConfiguracion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
