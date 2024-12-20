
import { describe, expect, test } from '@jest/globals';
import { insertarMensajeEnPortada } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/insertarMensajeEnPortada.mjs';
import { actualizarContenidoMensajeDePortada } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/actualizarContenidoMensajeDePortada.mjs';
import { actualizarEstadoMensajeDePortada } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/actualizarEstadoMensajeDePortada.mjs';
import { actualizaOrdenDePosiciones } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/actualizarOrdenDePosiciones.mjs';
import { actualizarPosicionDelMensajeDePortada } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/actualizarPosicionMensajeDePortada.mjs';
import { obtenerMensajePorMensajeUID } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/obtenerMensajePorMensajeUID.mjs';
import { obtenerMensajePorPosicion } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/obtenerMensajePorPosicion.mjs';
import { obtenerTodosLosMensjaes } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/obtenerTodosLosMensajes.mjs';
import { eliminarMensajeEnPortada } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/elminarMensajeEnPortada.mjs';
import { elminarMensajeEnPortadaPorTestingVI } from '../../../../src/infraestructure/repository/configuracion/mensajesPortada/elminarMensajeEnPortadaPorTestingVI.mjs';

describe('crud messages of front page', () => {
    const testingVI = "mensajeTEST"
    let nuevoMensajeUID

    beforeAll(async () => {
        await elminarMensajeEnPortadaPorTestingVI(testingVI)

    })
    test('insert new message', async () => {
        const response = await insertarMensajeEnPortada({
            mensajeB64: "testBase64",
            estadoInicial: "desactivado",
            posicionInicial: "999",
            testingVI: testingVI
        })
        nuevoMensajeUID = response.mensajeUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('update base64 of message', async () => {
        const response = await actualizarContenidoMensajeDePortada({
            mensajeUID: nuevoMensajeUID,
            mensajeB64: "testupdate",
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update status of message', async () => {
        const response = await actualizarEstadoMensajeDePortada({
            mensajeUID: nuevoMensajeUID,
            estadoIDV: "desactivado",
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update position for other messages after change posicion of message selected', async () => {
        const response = await actualizaOrdenDePosiciones(999);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('update message position in the list', async () => {
        const response = await actualizarPosicionDelMensajeDePortada({
            mensajeUID: nuevoMensajeUID,
            posicion: "1000"
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');

    })
    test('select message by mensajeUID', async () => {
        const response = await obtenerMensajePorMensajeUID(nuevoMensajeUID);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');

    })
    test('select message biy posicion', async () => {
        const response = await obtenerMensajePorPosicion(1000);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select all messages', async () => {
        const response = await obtenerTodosLosMensjaes();
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);

    })

    test('delete message by mensajeUID', async () => {
        const response = await eliminarMensajeEnPortada(nuevoMensajeUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await elminarMensajeEnPortadaPorTestingVI(testingVI)
    });
})
