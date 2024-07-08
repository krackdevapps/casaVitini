
import { describe, expect, test } from '@jest/globals';
import { eliminarEnlaceDePagoPorEnlaceTVI } from '../../../logica/repositorio/enlacesDePago/eliminarEnlaceDePagoPorEnlaceTVI.mjs';
import { insertarEnlaceDePago } from '../../../logica/repositorio/enlacesDePago/insertarEnlaceDePago.mjs';
import { insertarReservaAdministrativa } from '../../../logica/repositorio/reservas/reserva/insertarReservaAdministrativa.mjs';
import { eliminarReservaPorReservaTVI } from '../../../logica/repositorio/reservas/reserva/eliminarReservaPorReservaTVI.mjs';
import { actualizarEnlaceDePagoPorEnlaceUID } from '../../../logica/repositorio/enlacesDePago/actualizarEnlaceDePagoPorEnlaceUID.mjs';
import { actualizarEnlaceDePagoPorReservaUID } from '../../../logica/repositorio/enlacesDePago/actualizarEnlaceDePagoPorReservaUID.mjs';
import { actualizarEstadoEnlaceDePagoPorEnlaceUID } from '../../../logica/repositorio/enlacesDePago/actualizarEstadoEnlaceDePagoPorEnlaceUID.mjs';
import { obtenerEnlaceDePagoPorCodigoUPID } from '../../../logica/repositorio/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs';
import { obtenerEnlaceDePagoPorEnlaceUID } from '../../../logica/repositorio/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs';
import { obtenerTodosEnlaceDePago } from '../../../logica/repositorio/enlacesDePago/obtenerTodosLosEnlaceDePago.mjs';
import { eliminarEnlaceDePagoPorEnlaceUID } from '../../../logica/repositorio/enlacesDePago/eliminarEnlaceDePagoPorEnlaceUID.mjs';
import { eliminarEnlaceDePagoPorReservaUID } from '../../../logica/repositorio/enlacesDePago/eliminarEnlaceDePagoPorReservaUID.mjs';

describe('crud pay links', () => {
    const enlaceTVI = "enlaceTest"
    let nuevoEnlaceUID = 0
    let reservaUID = 0
    const reservaTVI = "reservaTest"
    const codigoPublico = "weopikfnwonerof"

    beforeAll(async () => {
        await eliminarEnlaceDePagoPorEnlaceTVI(enlaceTVI)
        await eliminarReservaPorReservaTVI(reservaTVI)
        const nuevaReserva = await insertarReservaAdministrativa({
            fechaEntrada: "2020-10-10",
            fechaSalida: "2020-11-11",
            estadoReserva: "confirmada",
            origen: "test",
            creacion: "2020-11-11",
            estadoPago: "noPagado",
            reservaTVI: reservaTVI
        })
        reservaUID = nuevaReserva.reservaUID

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
            enlaceTVI: enlaceTVI
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
            estado: "desactivado"
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select link pay by codigoUPID', async () => {
        const response = await obtenerEnlaceDePagoPorCodigoUPID(codigoPublico);
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
        await eliminarEnlaceDePagoPorEnlaceTVI(enlaceTVI)
        await eliminarReservaPorReservaTVI(reservaTVI)

    });
})
