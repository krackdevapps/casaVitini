
import { describe, expect, test } from '@jest/globals';
import { eliminarUsuarioPorTestingVI } from '../../../../logica/repositorio/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { crearCuentaDesdeAdministracion } from '../../../../logica/zonas/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { actualizarClaveUsuarioAdministracion } from '../../../../logica/zonas/administracion/usuarios/actualizarClaveUsuarioAdministracion.mjs';
import { actualizarDatosUsuarioDesdeAdministracion } from '../../../../logica/zonas/administracion/usuarios/actualizarDatosUsuarioDesdeAdministracion.mjs';
import { actualizarEstadoCuentaDesdeAdministracion } from '../../../../logica/zonas/administracion/usuarios/actualizarEstadoCuentaDesdeAdministracion.mjs';
import { actualizarIDXAdministracion } from '../../../../logica/zonas/administracion/usuarios/actualizarIDXAdministracion.mjs';
import { actualizarRolCuenta } from '../../../../logica/zonas/administracion/usuarios/actualizarRolCuenta.mjs';
import { buscarUsuarios } from '../../../../logica/zonas/administracion/usuarios/buscarUsuarios.mjs';
import { datosCuentaIDX } from '../../../../logica/zonas/administracion/usuarios/datosCuentaIDX.mjs';
import { detallesUsuario } from '../../../../logica/zonas/administracion/usuarios/detallesUsuario.mjs';
import { obtenerRoles } from '../../../../logica/zonas/administracion/usuarios/obtenerRoles.mjs';
import { eliminarCuentaDesdeAdministracion } from '../../../../logica/zonas/administracion/usuarios/eliminarCuentaDesdeAdministracion.mjs';

describe('managin users', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    const testingVI = "testingmanaginusers"

    beforeAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
        process.env.TESTINGVI = testingVI

    })
    test('create user from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting",
                clave: "1234567890",
                rolIDV: "cliente"
            },
            session: fakeAdminSession
        }
        const response = await crearCuentaDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update pass for user from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting",
                claveNueva: "1234567890A!",
                claveNuevaDos: "1234567890A!"
            },
            session: fakeAdminSession
        }
        const response = await actualizarClaveUsuarioAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update data of user from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting",
                nombre: "fakename",
                primerApellido: "lastname",
                segundoApellido: "seconlastname",
                pasaporte: "pasaportetestingmanaginusers",
                mail: "fake@fake.com",
                telefono: "43534534345"
            },
            session: fakeAdminSession
        }
        const response = await actualizarDatosUsuarioDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update status of account from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting",
                nuevoEstado: "activado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoCuentaDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update IDX of account from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting",
                nuevoIDX: "userfortesting1"
            },
            session: fakeAdminSession
        }
        const response = await actualizarIDXAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update rol of account from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting1",
                nuevoRol: "cliente"
            },
            session: fakeAdminSession
        }
        const response = await actualizarRolCuenta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('search users from adminitration', async () => {
        const m = {
            body: {
                buscar: "userfortesting1"
            },
            session: fakeAdminSession
        }
        const response = await buscarUsuarios(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('details of user account from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting1",
            },
            session: fakeAdminSession
        }
        const response = await datosCuentaIDX(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('details of user data account from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting1",
            },
            session: fakeAdminSession
        }
        const response = await detallesUsuario(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get rols avaibles from adminitration', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerRoles(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete user acount account from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: "userfortesting1",
            },
            session: fakeAdminSession
        }
        const response = await eliminarCuentaDesdeAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
    })

})