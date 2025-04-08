
import { describe, expect, test } from '@jest/globals';
import { eliminarUsuarioPorTestingVI } from '../../../../src/infraestructure/repository/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { crearCuentaDesdeAdministracion } from '../../../../src/application/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { crearNuevoGrupo } from '../../../../src/application/administracion/usuarios/grupos/crearNuevoGrupo.mjs';
import { eliminarGrupoPorTestingVI } from '../../../../src/infraestructure/repository/usuarios/grupos/eliminarGrupoPorTestingVI.mjs';
import { actualizarNombreGrupo } from '../../../../src/application/administracion/usuarios/grupos/actualizarNombreGrupo.mjs';
import { obtenerDetallesDelGrupo } from '../../../../src/application/administracion/usuarios/grupos/obtenerDetallesDelGrupo.mjs';
import { actualizarPermisoControladorDelGrupo } from '../../../../src/application/administracion/usuarios/grupos/actualizarPermisoControladorDelGrupo.mjs';
import { actualizarPermisoVistaDelGrupo } from '../../../../src/application/administracion/usuarios/grupos/actualizarPermisoVistaDelGrupo.mjs';
import { insertarUsuarioEnGrupo } from '../../../../src/application/administracion/usuarios/grupos/insertarUsuarioEnGrupo.mjs';
import { eliminarUsuarioDelGrupo } from '../../../../src/application/administracion/usuarios/grupos/eliminarUsuarioDelGrupo.mjs';
import { obtenerPermisosMasPermisisvosDelUsuario } from '../../../../src/application/administracion/usuarios/grupos/obtenerPermisosMasPermisisvosDelUsuario.mjs';
import { obtenerTodosLosGrupos } from '../../../../src/application/administracion/usuarios/grupos/obtenerTodosLosGrupos.mjs';
import { eliminarGrupo } from '../../../../src/application/administracion/usuarios/grupos/eliminarGrupo.mjs';

describe('managin groups', () => {
    const fakeAdminSession = {
        usuario: "testadmintemporal",
        rolIDV: "administrador"
    }
    const testingVI = "testingmanaginusers"
    process.env.TESTINGVI = testingVI
    beforeAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarGrupoPorTestingVI(testingVI)
    })
    let grupoUID
    let permisoPrimeraVista
    let permisoPrimerControlador
    test('create user from administration for operations', async () => {
        const response = await crearCuentaDesdeAdministracion({
            body: {
                usuarioIDX: fakeAdminSession.usuario,
                clave: "1234567890A!",
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('create groups', async () => {
        const response = await crearNuevoGrupo({
            body: {
                grupoUI: "New group for testing"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        grupoUID = response.grupoUID
    })


    test('update name of group', async () => {
        const response = await actualizarNombreGrupo({
            body: {
                grupoUI: "New group for testing",
                grupoUID
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get details of group', async () => {
        const response = await obtenerDetallesDelGrupo({
            body: {
                grupoUID,
                contenedores: ["permisos"]
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        permisoPrimerControlador = response.permisosDeLosControladoresDelGrupo[0]
        permisoPrimeraVista = response.permisosDeLasVistasDelGrupo[0]



    })


    test('update controller permissions', async () => {
        const response = await actualizarPermisoControladorDelGrupo({
            body: {
                permisoUID: permisoPrimerControlador.uid,
                permisoIDV: "noPermitido"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('update view permissions', async () => {
        const response = await actualizarPermisoVistaDelGrupo({
            body: {
                permisoUID: permisoPrimeraVista.uid,
                permisoIDV: "noPermitido"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })


    test('insert user in group', async () => {
        const response = await insertarUsuarioEnGrupo({
            body: {
                grupoUID,
                usuario: fakeAdminSession.usuario
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })


    test('delete user in group', async () => {
        const response = await eliminarUsuarioDelGrupo({
            body: {
                grupoUID,
                usuario: fakeAdminSession.usuario
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('obtain more restrictive user permissions', async () => {
        const response = await obtenerPermisosMasPermisisvosDelUsuario({
            body: {},
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all groups', async () => {
        const response = await obtenerTodosLosGrupos()
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete group', async () => {
        const response = await eliminarGrupo({
            body: {
                grupoUID,
            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarGrupoPorTestingVI(testingVI)

    })

})
