
import { describe, expect, test } from '@jest/globals';

describe('crud ofers', () => {
    const ofertaTVI = "ofertaTest"
    const usuarioTest = "usuario_for_testing"
    let nuevaOfertaUID = 0
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
    test('insert offer', async () => {
        const response = await insertarOferta({
            nombreOferta: "oferta_test",
            fechaInicio_ISO: "2020-10-10",
            fechaFin_ISO: "2020-10-11",
            simboloNumero: "aPartirDe",
            numero: "1",
            descuentoAplicadoA: "totalNetoReserva",
            tipoOferta: "porApartamentosEspecificos",
            cantidad: 10.00,
            tipoDescuento: "porcentaje",
            ofertaTVI: ofertaTVI
        })
        nuevaOfertaUID = response.ofertaUID
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
