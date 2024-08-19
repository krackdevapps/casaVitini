
import { describe, expect, test, jest } from '@jest/globals';
import { eliminarUsuarioPorTestingVI } from '../../../logica/repositorio/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { crearCuentaDesdeAdministracion } from '../../../logica/zonas/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { actualizarClaveUsuarioDesdeMicasa } from '../../../logica/zonas/miCasa/actualizarClaveUsuarioDesdeMicasa.mjs';
import { actualizarDatosUsuarioDesdeMiCasa } from '../../../logica/zonas/miCasa/actualizarDatosUsuarioDesdeMiCasa.mjs';
import { actualizarIDX } from '../../../logica/zonas/miCasa/actualizarIDX.mjs';
import { cerrarSessionSelectivamenteDesdeMiCasa } from '../../../logica/zonas/miCasa/cerrarSessionSelectivamenteDesdeMiCasa.mjs';
import { datosPersonalesDesdeMiCasa } from '../../../logica/zonas/miCasa/datosPersonalesDesdeMiCasa.mjs';
import { obtenerSessionesActivasDesdeMiCasa } from '../../../logica/zonas/miCasa/obtenerSessionesActivasDesdeMiCasa.mjs';
import { conectar } from '../../../logica/zonas/IDX/conectar.mjs';
import { actualizarEstadoCuentaDesdeAdministracion } from '../../../logica/zonas/administracion/usuarios/actualizarEstadoCuentaDesdeAdministracion.mjs';
import { verificarCuenta } from '../../../logica/zonas/miCasa/verificarCuenta.mjs';
import { obtenerUsuario } from '../../../logica/repositorio/usuarios/obtenerUsuario.mjs';
import { eliminarCuentaDesdeMiCasa } from '../../../logica/zonas/miCasa/eliminarCuentaDesdeMiCasa.mjs';

describe('miCasa Metodos', () => {
    const testingVI = "testingmicasametodos"
    const usuarioIDV_inicial = "userfortestingformicasametodos"
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
    test('create user from administration with ok', async () => {
        const m = {
            body: {
                usuarioIDX: usuarioIDV_inicial,
                clave: clave_inicial,
                rolIDV: "cliente"
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

    test('update password of account from user panel with ok', async () => {
        const m = {
            body: {
                usuarioIDX: usuarioIDV_inicial,
                claveActual: clave_inicial,
                claveNueva: clave_inicial + "1",
                claveConfirmada: clave_inicial + "1"
            },
            session: fakeAdminSession
        }
        const response = await actualizarClaveUsuarioDesdeMicasa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update data of user account', async () => {
        const m = {
            body: {
                nombre: "test",
                primerApellido: "test",
                segundoApellido: "test",
                pasaporte: "test",
                mail: "fake@fake.com",
                telefono: "6541654"
            },
            session: fakeAdminSession
        }
        const response = await actualizarDatosUsuarioDesdeMiCasa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get details of data of user account', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await datosPersonalesDesdeMiCasa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all active sessions  of user account', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerSessionesActivasDesdeMiCasa(m)

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('close session of user account', async () => {
        const m = {
            body: {
                tipoOperacion: "todasMenosActual"
            },
            session: fakeAdminSession
        }
        const response = await cerrarSessionSelectivamenteDesdeMiCasa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('verifiy IDX of user account', async () => {

        const usuarioDetalles = await obtenerUsuario({
            usuario: usuarioIDV_inicial,
            errorSi: "noExiste"
        })
        const codigoVerificacion = usuarioDetalles.codigoVerificacion
        const m = {
            body: {
                codigo: codigoVerificacion
            },
            session: fakeAdminSession
        }
        const response = await verificarCuenta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update IDX of user account', async () => {
        const m = {
            body: {
                actualIDX: usuarioIDV_inicial,
                nuevoIDX: usuarioIDV_inicial + "1"
            },
            session: fakeAdminSession
        }
        const response = await actualizarIDX(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete IDX of user account', async () => {
        fakeAdminSession.usuario = usuarioIDV_inicial + "1"
        const m = {
            body: {
                clave: clave_inicial + "1"
            },
            session: fakeAdminSession
        }
        const s = {
            clearCookie: () => {
                return true
            }
        }
        const response = await eliminarCuentaDesdeMiCasa(m, s)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
    })

})
