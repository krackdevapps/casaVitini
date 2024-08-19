
import { describe, expect, test } from '@jest/globals';
import { eliminarUsuarioPorTestingVI } from '../../../logica/repositorio/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { conectar } from '../../../logica/zonas/IDX/conectar.mjs';
import { crearCuentaDesdeAdministracion } from '../../../logica/zonas/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { actualizarEstadoCuentaDesdeAdministracion } from '../../../logica/zonas/administracion/usuarios/actualizarEstadoCuentaDesdeAdministracion.mjs';
import { estado } from '../../../logica/zonas/IDX/estado.mjs';
import { desconectar } from '../../../logica/zonas/IDX/desconectar.mjs';

describe('testingIDXSystem', () => {

    const testingVI = "testingidxsystem"
    const usuarioIDV_inicial = "userfortesting"
    const clave_inicial = "123456789A!"
    const fakeAdminSession = {
        usuario: usuarioIDV_inicial,
        rolIDV: "administrador",
        destroy: () => {
            const clearCookie = {
                clear: null
            }
            return true
        }
    }

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarUsuarioPorTestingVI(testingVI)

    })
    test('create user from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: usuarioIDV_inicial,
                clave: clave_inicial,
                rolIDV: "cliente",
            },
            session: fakeAdminSession,

        }
        const response = await crearCuentaDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('update status of account from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: usuarioIDV_inicial,
                nuevoEstado: "activado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoCuentaDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('connect to session', async () => {
        const m = {
            body: {
                usuario: usuarioIDV_inicial,
                clave: clave_inicial,

            },
            session: {},
            get: () => {
                return "User Agent for Testing"
            }
        }
        const response = await conectar(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('status of session', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await estado(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('estadoIDV');
    })


    test('disconnect of session', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const s = {
            clearCookie: () => {
                return "User Agent for Testing"
            }
        }
        const response = await desconectar(m, s)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('estadoIDV');
    })

    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)

    })

})
