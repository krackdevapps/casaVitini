
import { describe, expect, test } from '@jest/globals';
import { eliminarUsuarioPorTestingVI } from '../../../logica/repositorio/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { enviarCorreo } from '../../../logica/zonas/miCasa/recuperarCuenta/enviarCorreo.mjs';
import { validarCodigo } from '../../../logica/zonas/miCasa/recuperarCuenta/validarCodigo.mjs';
import { crearCuentaDesdeAdministracion } from '../../../logica/zonas/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { actualizarDatosUsuarioDesdeAdministracion } from '../../../logica/zonas/administracion/usuarios/actualizarDatosUsuarioDesdeAdministracion.mjs';
import { obtenerEnlacesRecuperacionPorUsuario } from '../../../logica/repositorio/enlacesDeRecuperacion/obtenerEnlacesRecuperacionPorUsuario.mjs';
import { obtenerUsuario } from '../../../logica/repositorio/usuarios/obtenerUsuario.mjs';
import { verificarCuenta } from '../../../logica/zonas/miCasa/verificarCuenta.mjs';
import { restablecerClave } from '../../../logica/zonas/miCasa/recuperarCuenta/restablecerClave.mjs';

describe('account recovery', () => {
    const testingVI = "testingbookingmicasa"
    const usuarioIDV_inicial = "userfortestingformicasametodos"
    const fakeAdminSession = {
        usuario: usuarioIDV_inicial,
        rolIDV: "administrador",
    }
    const mail_fake = "fake@mail.com"
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarUsuarioPorTestingVI(testingVI)
    })
    test('create user from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: usuarioIDV_inicial,
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
    test('update data of user from adminitration', async () => {
        const m = {
            body: {
                usuarioIDX: usuarioIDV_inicial,
                nombre: "fakename",
                primerApellido: "lastname",
                segundoApellido: "seconlastname",
                pasaporte: "pasaportetestingmanaginusers",
                mail: mail_fake,
                telefono: "43534534345"
            },
            session: fakeAdminSession
        }
        const response = await actualizarDatosUsuarioDesdeAdministracion(m)
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
    test('send mail recovery for account with ok', async () => {
        const m = {
            body: {
                mail: mail_fake,
            },
            session: {},

        }
        const response = await enviarCorreo(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('validate recovery code with ok', async () => {
        const enlaceDeRecuperacion = await obtenerEnlacesRecuperacionPorUsuario(usuarioIDV_inicial)
        const codigoUPID = enlaceDeRecuperacion.codigoUPID
        const m = {
            body: {
                codigo: codigoUPID
            },
            session: fakeAdminSession,
        }
        const response = await validarCodigo(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('restore pass of user account with ok', async () => {
        const enlaceDeRecuperacion = await obtenerEnlacesRecuperacionPorUsuario(usuarioIDV_inicial)
        const codigoUPID = enlaceDeRecuperacion.codigoUPID
        const m = {
            body: {
                codigo: codigoUPID,
                clave: "123456789A!",
                claveConfirmada: "123456789A!"
            },
            session: fakeAdminSession,

        }
        const response = await restablecerClave(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
    })

})
