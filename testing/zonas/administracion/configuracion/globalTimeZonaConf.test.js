
import { describe, expect, test } from '@jest/globals';
import { obtenerConfiguracion } from '../../../../logica/zonas/administracion/configuracion/zonaHoraria/obtenerConfiguracion.mjs';
import { guardarConfiguracion } from '../../../../logica/zonas/administracion/configuracion/zonaHoraria/guardarConfiguracion.mjs';

describe('Global time zona conf', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    test('get actual time zona of system with ok', async () => {
        const makeEntity = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerConfiguracion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update time zona of system for bookins with ok', async () => {
        const makeEntity = {
            body: {
                zonaHoraria: "America/Managua"
            },
            session: fakeAdminSession
        }
        const response = await guardarConfiguracion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
