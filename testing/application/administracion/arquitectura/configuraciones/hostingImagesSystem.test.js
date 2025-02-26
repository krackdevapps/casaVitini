
import { describe, expect, test } from '@jest/globals';
import { campoDeTransaccion } from '../../../../../src/infraestructure/repository/globales/campoDeTransaccion.mjs';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { subirNuevaImagen } from '../../../../../src/application/administracion/arquitectura/configuraciones/gestionImagenes/subirNuevaImagen.mjs';
import { base64Assets } from '../../../../sharedAssets/base64Assets.mjs';
import { actualizarImagen } from '../../../../../src/application/administracion/arquitectura/configuraciones/gestionImagenes/actualizarImagen.mjs';
import { actualizarPosicionImagen } from '../../../../../src/application/administracion/arquitectura/configuraciones/gestionImagenes/actualizarPosicionImagen.mjs';
import { eliminarImagen } from '../../../../../src/application/administracion/arquitectura/configuraciones/gestionImagenes/eliminarImagen.mjs';
import { obtenerImagenesDelAlojamiento } from '../../../../../src/application/administracion/arquitectura/configuraciones/gestionImagenes/obtenerImagenesDelAlojamiento.mjs';

describe('hostingImagesSystem', () => {
    const apartamentoIDV = "hostingTemporal"
    const apartamentoUI = "Apartamento para testing de configuraciones de alojamiento"
    const habitacionIDV = "habitacionparatestingdeconfiguraciones"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaUI = "camaTemporalParaTesting"
    const camaIDV = "camatestingdeconfiguraciones"
    const testingVI = "hostingTemporalForTesting"
    const fakeAdminSession = {
        usuario: "fakekAdmin",
        rolIDV: "administrador"
    }
    let imagenUID
    const assets = base64Assets()
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: apartamentoUI,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI,
            camaIDV: camaIDV,
            camaUI: camaUI,
        })

    })
    test('upload new image JPEG for hosting ok', async () => {
        const response = await subirNuevaImagen({
            body: {
                apartamentoIDV: apartamentoIDV,
                contenidoArchivo: assets.images.jpeg

            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('upload new image png for hosting ok', async () => {
        const response = await subirNuevaImagen({
            body: {
                apartamentoIDV: apartamentoIDV,
                contenidoArchivo: assets.images.png

            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('upload new image tiff for hosting ok', async () => {
        const response = await subirNuevaImagen({
            body: {
                apartamentoIDV: apartamentoIDV,
                contenidoArchivo: assets.images.tiff

            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        imagenUID = response.imagenUID
    })



    test('update image for hosting ok', async () => {
        const response = await actualizarImagen({
            body: {
                apartamentoIDV: apartamentoIDV,
                contenidoArchivo: assets.images.tiff,
                imagenUID: imagenUID

            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update position of image for hosting ok', async () => {
        const response = await actualizarPosicionImagen({
            body: {
                apartamentoIDV: apartamentoIDV,
                nuevaPosicion: "1",
                imagenUID: imagenUID

            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get all images of hosting ok', async () => {
        const response = await obtenerImagenesDelAlojamiento({
            body: {
                apartamentoIDV: apartamentoIDV,
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delte image o hosting ok', async () => {
        const response = await eliminarImagen({
            body: {
                apartamentoIDV: apartamentoIDV,
                imagenUID: imagenUID,
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    afterAll(async () => {
        await campoDeTransaccion("cancelar")
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })


    })
})
