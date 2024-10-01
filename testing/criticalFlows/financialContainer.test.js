
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { obtenerReserva } from '../../src/application/administracion/reservas/detallesReserva/global/obtenerReserva.mjs';

describe('critical: financiarContianer', () => {
    const testingVI = "testingfinanciarcontainer"

    const apartamentoIDV = "apartmenttestingfinanciarcontainer"
    const apartamentoUI = "Apartamento temporal testingfinanciarcontainer"
    const habitacionIDV = "testingfinanciarcontainer"
    const habitacionUI = "Habitacion temporal testingfinanciarcontainer"
    const camaIDV = "bedtestingfinanciarcontainer"
    const camaUI = "Cama temporal testingfinanciarcontainer"

    let reservaUID
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
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
    })

    test('create first booking void', async () => {
        const m = {
            body: {
                fechaEntrada: "2027-10-10",
                fechaSalida: "2027-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada"

            },
            session: fakeAdminSession
        }
        const response = await crearReservaSimpleAdministrativa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        reservaUID = response.reservaUID
    })
    test('get details of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                capas: ["desgloseFinanciero"]
            },
            session: fakeAdminSession
        }
        const response = await obtenerReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        const totalNeto = response.ok.contenedorFinanciero.desgloseFinanciero.global.totales.totalNeto
        expect(totalNeto).toBe("1000.00")
    })


    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await eliminarReservaPorTestingVI(testingVI)
    });
})
