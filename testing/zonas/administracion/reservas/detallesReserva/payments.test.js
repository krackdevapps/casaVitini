
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../logica/zonas/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { crearPagoManual } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/transacciones/crearPagoManual.mjs';
import { obtenerDetallesDelPago } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/transacciones/obtenerDetallesDelPago.mjs';
import { realizarReembolso } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/transacciones/realizarReembolso.mjs';
import { detallesDelReembolso } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/transacciones/detallesDelReembolso.mjs';
import { eliminarReembolsoManual } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/transacciones/eliminarReembolsoManual.mjs';
import { eliminarPagoManual } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/transacciones/eliminarPagoManual.mjs';

describe('payment in bookin', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    let pagoUID
    let reembolsoUID
    const testingVI = "testingpaymentstereserve"
    const apartamentoIDV = "apartmenttestingpaymentstereserve"
    const apartamentoUI = "Apartamento temporal creado testing payments"
    const habitacionIDV = "roomtestingpaymentstereserve"
    const habitacionUI = "Habitacion temporal para testing payments"
    const camaIDV = "bedtestingpayments"
    const camaUI = "Cama temporal para testing payments"

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: apartamentoUI,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI,
            camaIDV: camaIDV,
            camaUI: camaUI,
        })


        // Crear reserva
        const reserva = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID
    })

    test('create payment in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                plataformaDePago: "efectivo",
                cantidad: "10.00"
            },
            session: fakeAdminSession
        }
        const response = await crearPagoManual(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

        pagoUID = response.detallesDelPago.pagoUID

    })


    test('get details payment in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pagoUID: pagoUID
            },
            session: fakeAdminSession
        }
        const response = await obtenerDetallesDelPago(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create refund payment in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pagoUID: pagoUID,
                cantidad: "10.00",
                palabra: "reembolso",
                tipoReembolso: "porCantidad",
                plataformaDePagoEntrada: "efectivo"
            },
            session: fakeAdminSession
        }
        const response = await realizarReembolso(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        reembolsoUID = response.reembolsoUID
    })
    test('get details of refund payment in booking with ok', async () => {
        const m = {
            body: {
                reembolsoUID: String(reembolsoUID)
            },
            session: fakeAdminSession
        }
        const response = await detallesDelReembolso(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete refund payment in booking with ok', async () => {
        const m = {
            body: {
                reembolsoUID: String(reembolsoUID),
                palabra: "eliminar"
            },
            session: fakeAdminSession
        }
        const response = await eliminarReembolsoManual(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete payment in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pagoUID: String(pagoUID),
                palabra: "eliminar"
            },
            session: fakeAdminSession
        }
        const response = await eliminarPagoManual(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
