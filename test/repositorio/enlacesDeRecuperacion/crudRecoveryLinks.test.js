
import { describe, expect, test } from '@jest/globals';
import { eliminarEnlacesDeRecuperacionPorUsuario } from '../../../logica/repositorio/enlacesDeRecuperacion/eliminarEnlacesDeRecuperacionPorUsuario.mjs';
import { eliminarUsuario } from '../../../logica/repositorio/usuarios/eliminarUsuario.mjs';
import { insertarUsuario } from '../../../logica/repositorio/usuarios/insertarUsuario.mjs';
import { insertarEnlaceDeRecuperacion } from '../../../logica/repositorio/enlacesDeRecuperacion/insertarEnlaceDeRecuperacion.mjs';
import { actualizarEnlaceDePagoPorEnlaceUID } from '../../../logica/repositorio/enlacesDePago/actualizarEnlaceDePagoPorEnlaceUID.mjs';
import { actualizarEnlaceDeRecuperacionPorUsuario } from '../../../logica/repositorio/enlacesDeRecuperacion/actualizarEnlaceDeRecuperacionPorUsuario.mjs';
import { obtenerEnlacesRecuperacionPorCodigoUPID } from '../../../logica/repositorio/enlacesDeRecuperacion/obtenerEnlacesRecuperacionPorCodigoUPID.mjs';
import { eliminarEnlacesDeRecuperacionPorFechaCaducidad } from '../../../logica/repositorio/enlacesDeRecuperacion/eliminarEnlacesDeRecuperacionPorFechaCaducidad.mjs';

describe('crud recovery links', () => {
    const enlaceTVI = "enlaceTest"
    const usuarioTest = "usuario_for_testing"
    let nuevoEnlaceUID = 0
    const reservaTVI = "reservaTest"
    const codigoPublico = "weopikfnwonerof"

    beforeAll(async () => {
        await eliminarEnlacesDeRecuperacionPorUsuario(usuarioTest)
        await eliminarUsuario(usuarioTest)
        await insertarUsuario({
            usuarioIDX: usuarioTest,
            rolIDV: "cliente",
            estadoCuenta: "desactivado",
            nuevaSal: "123",
            hashCreado: "123",
            cuentaVerificada: "noVerificada",
            fechaCaducidadCuentaNoVerificada: null,
        })

    })
    test('insert new recovery link', async () => {
        const response = await insertarEnlaceDeRecuperacion({
            usuarioIDX: usuarioTest,
            codigoGenerado: codigoPublico,
            fechaCaducidadUTC: "2022-10-10",
        })
        nuevoEnlaceUID = response.enlaceUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update pay link with enlaceUID', async () => {
        const response = await actualizarEnlaceDeRecuperacionPorUsuario({
            usuario: usuarioTest,
            codigoGenerado: codigoPublico,
            fechaActualUTC: "2020-11-11",
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('select recovery link by codigoUPID', async () => {
        const response = await obtenerEnlacesRecuperacionPorCodigoUPID(codigoPublico);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })



    test('delete recovery link usuario', async () => {
        const response = await eliminarEnlacesDeRecuperacionPorUsuario(usuarioTest);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('delete recovery link by actual date', async () => {
        const response = await eliminarEnlacesDeRecuperacionPorFechaCaducidad("2020-10-10");
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await eliminarUsuario(usuarioTest)
        await eliminarEnlacesDeRecuperacionPorUsuario(usuarioTest)


    });
})
