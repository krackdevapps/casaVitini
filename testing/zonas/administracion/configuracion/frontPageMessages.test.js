
import { describe, expect, test } from '@jest/globals';
import { crearMensaje } from '../../../../logica/zonas/administracion/configuracion/mensajesEnPortada/crearMensaje.mjs';
import { elminarMensajeEnPortadaPorTestingVI } from '../../../../logica/repositorio/configuracion/mensajesPortada/elminarMensajeEnPortadaPorTestingVI.mjs';
import { actualizarEstado } from '../../../../logica/zonas/administracion/configuracion/mensajesEnPortada/actualizarEstado.mjs';
import { actualizarMensaje } from '../../../../logica/zonas/administracion/configuracion/mensajesEnPortada/actualizarMensaje.mjs';
import { detallesDelMensaje } from '../../../../logica/zonas/administracion/configuracion/mensajesEnPortada/detallesDelMensaje.mjs';
import { moverPosicion } from '../../../../logica/zonas/administracion/configuracion/mensajesEnPortada/moverPosicion.mjs';
import { obtenerMensajes } from '../../../../logica/zonas/administracion/configuracion/mensajesEnPortada/obtenerMensajes.mjs';
import { eliminarMensaje } from '../../../../logica/zonas/administracion/configuracion/mensajesEnPortada/eliminarMensaje.mjs';

describe('Frontpage messages system', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "testing"
    let mensajeUID
    beforeAll(async () => {
        await elminarMensajeEnPortadaPorTestingVI(testingVI)
        process.env.TESTINGVI = testingVI

    })

    test('create new message with ok', async () => {
        const m = {
            body: {
                mensaje: "Mensaje de prueba para testing",
            },
            session: fakeAdminSession
        }
        const response = await crearMensaje(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        mensajeUID = response.mensajeUID
    })

    test('update status message with ok', async () => {
        const m = {
            body: {
                mensajeUID,
                estadoIDV: "desactivado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstado(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update text of message with ok', async () => {
        const m = {
            body: {
                mensajeUID,
                mensaje: "mensaje actualizado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarMensaje(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get details of message with ok', async () => {
        const m = {
            body: {
                mensajeUID
            },
            session: fakeAdminSession
        }
        const response = await detallesDelMensaje(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update position of message with ok', async () => {

        const m_volatil = {
            body: {
                mensaje: "Mensaje de prueba para testing",
            },
            session: fakeAdminSession
        }
        await crearMensaje(m_volatil)
        // Aqui hay dos mensaje para poder mover de posicion.
        const m = {
            body: {
                mensajeUID,
                nuevaPosicion: "2"
            },
            session: fakeAdminSession
        }
        const response = await moverPosicion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all messages with ok', async () => {
        const m = {
            body: {            },
            session: fakeAdminSession
        }
        const response = await obtenerMensajes(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete message by mensajeUID with ok', async () => {
        const m = {
            body: {           
                mensajeUID
             },
            session: fakeAdminSession
        }
        const response = await eliminarMensaje(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await elminarMensajeEnPortadaPorTestingVI(testingVI)
    });

})
