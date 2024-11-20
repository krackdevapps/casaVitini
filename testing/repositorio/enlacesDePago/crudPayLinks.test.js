
import { describe, expect, test } from '@jest/globals';
import { insertarEnlaceDePago } from '../../../src/infraestructure/repository/enlacesDePago/insertarEnlaceDePago.mjs';
import { insertarReservaAdministrativa } from '../../../src/infraestructure/repository/reservas/reserva/insertarReservaAdministrativa.mjs';
import { actualizarEnlaceDePagoPorEnlaceUID } from '../../../src/infraestructure/repository/enlacesDePago/actualizarEnlaceDePagoPorEnlaceUID.mjs';
import { actualizarEnlaceDePagoPorReservaUID } from '../../../src/infraestructure/repository/enlacesDePago/actualizarEnlaceDePagoPorReservaUID.mjs';
import { actualizarEstadoEnlaceDePagoPorEnlaceUID } from '../../../src/infraestructure/repository/enlacesDePago/actualizarEstadoEnlaceDePagoPorEnlaceUID.mjs';
import { obtenerEnlaceDePagoPorCodigoUPID } from '../../../src/infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs';
import { obtenerEnlaceDePagoPorEnlaceUID } from '../../../src/infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs';
import { obtenerTodosEnlaceDePago } from '../../../src/infraestructure/repository/enlacesDePago/obtenerTodosLosEnlaceDePago.mjs';
import { eliminarEnlaceDePagoPorEnlaceUID } from '../../../src/infraestructure/repository/enlacesDePago/eliminarEnlaceDePagoPorEnlaceUID.mjs';
import { eliminarEnlaceDePagoPorReservaUID } from '../../../src/infraestructure/repository/enlacesDePago/eliminarEnlaceDePagoPorReservaUID.mjs';
import { generadorReservaUID } from '../../../src/shared/reservas/utilidades/generadorReservaUID.mjs';
import { eliminarEnlaceDePagoPorTestingVI } from '../../../src/infraestructure/repository/enlacesDePago/eliminarEnlaceDePagoPorTestingVI.mjs';
import { eliminarReservaPorTestingVI } from '../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';

describe('crud pay links', () => {
    const testingVI = "testingpaylinkgadapters"
    let nuevoEnlaceUID = 0
    let reservaUID
    const codigoPublico = "weopikfnwonerof"

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        reservaUID = await generadorReservaUID()

        await eliminarEnlaceDePagoPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await insertarReservaAdministrativa({
            fechaEntrada: "2020-10-10",
            fechaSalida: "2020-11-11",
            estadoReserva: "confirmada",
            origen: "test",
            creacion: "2020-11-11",
            estadoPago: "noPagado",
            reservaUID: reservaUID,
            testingVI: testingVI,
        })
    })
    test('insert new pay link', async () => {
        const response = await insertarEnlaceDePago({
            nombreEnlace: "Enlace creado para testing",
            reservaUID: reservaUID,
            descripcion: "Enlace generado para hacer testing",
            fechaDeCaducidad: "2020-10-10",
            cantidad: "10.100",
            codigoAleatorioUnico: codigoPublico,
            estadoPagoInicial: "noPagado",
            testingVI: testingVI
        })
        nuevoEnlaceUID = response.enlaceUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update pay link with enlaceUID', async () => {
        const response = await actualizarEnlaceDePagoPorEnlaceUID({
            nombreEnlace: "enlaceActualizado",
            descripcion: "enlace actualizado",
            cantidad: "12.00",
            fechaDeCaducidad: "2020-11-11",
            enlaceUID: nuevoEnlaceUID
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('update pay link with reservaUID', async () => {
        const response = await actualizarEnlaceDePagoPorReservaUID({
            nombreEnlace: "enlaceActualizado",
            descripcion: "enlace actualizado",
            cantidad: "12.00",
            fechaDeCaducidad: "2020-11-11",
            reservaUID: reservaUID
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update status pay link with reservaUID', async () => {
        const response = await actualizarEstadoEnlaceDePagoPorEnlaceUID({
            enlaceUID: nuevoEnlaceUID,
            estado: "noPagado"
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select link pay by codigoUPID', async () => {
        const response = await obtenerEnlaceDePagoPorCodigoUPID({
            codigoUPID: codigoPublico,
            errorSi: "noExiste"
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');

    })

    test('select link pay by enlaceUID', async () => {
        const response = await obtenerEnlaceDePagoPorEnlaceUID(nuevoEnlaceUID);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');

    })

    test('select all pay links', async () => {
        const response = await obtenerTodosEnlaceDePago();
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('delete message by enlaceUID', async () => {
        const response = await eliminarEnlaceDePagoPorEnlaceUID(nuevoEnlaceUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('delete message by reservaUID', async () => {
        const response = await eliminarEnlaceDePagoPorReservaUID(reservaUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await eliminarEnlaceDePagoPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
    });
})
