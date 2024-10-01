
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { reconstruirDesgloseDesdeHubs } from '../../../../../src/application/administracion/reservas/detallesReserva/contenedorFinanciero/reconstruirDesgloseDesdeHubs.mjs';
import { reconstruirDesgloseDesdeInstantaneas } from '../../../../../src/application/administracion/reservas/detallesReserva/contenedorFinanciero/reconstruirDesgloseDesdeInstantaneas.mjs';

describe('financial contaniner', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    const testingVI = "testingaddfinancialcontainergtoreserve"
    const apartamentoIDV = "apartamentfortestingaddfinancialcontainergtoreserve"
    const apartamentoUI = "Apartamento temporal financial container"
    const habitacionIDV = "temporalroomfortestingaddfinancialcontainergtoreserve"
    const habitacionUI = "Habitacion temporal para testing financial container"
    const camaIDV = "temporalbedfortestingaddapartamentotoreserve"
    const camaUI = "Cama temporal para testing de financial container"

    const apartamentoIDV_2 = "apartamentfortestingaddfinancialcontainergtoreservetwo"
    const habitacionIDV_2 = "temporalroomfortestingaddfinancialcontainergtoreservetwo"
    const camaIDV_2 = "temporalbedfortestingaddapartamentotoreservetwo"



    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2,
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await eliminarReservaPorTestingVI(testingVI)
        // Crear una primera arquitectura de alojamineto para crear al reserva.
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
                estadoInicialIDV: "confirmada"

            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID
    })

    test('remake financiar container from hubs with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                palabra: "reconstruir"
            },
            session: fakeAdminSession
        }
        const response = await reconstruirDesgloseDesdeHubs(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('remake financiar container from snapshots with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeAdminSession
        }
        const response = await reconstruirDesgloseDesdeInstantaneas(m)
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
