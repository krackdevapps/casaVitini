
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarClientePorTestingVI } from '../../../../../src/infraestructure/repository/clientes/eliminarClientePorTestingVI.mjs';
import { crearClienteDesdeReservaYAnadirloAreserva } from '../../../../../src/application/administracion/reservas/detallesReserva/pernoctantes/crearClienteDesdeReservaYAnadirloAreserva.mjs';
import { anadirApartamentoReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/alojamiento/anadirApartamentoReserva.mjs';
import { anadirHabitacionAlApartamentoEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/alojamiento/anadirHabitacionAlApartamentoEnReserva.mjs';
import { confirmarFechaCheckIn } from '../../../../../src/application/administracion/reservas/detallesReserva/pernoctantes/confirmarFechaCheckIn.mjs';
import { confirmarFechaCheckOutAdelantado } from '../../../../../src/application/administracion/reservas/detallesReserva/pernoctantes/confirmarFechaCheckOutAdelantado.mjs';
import { detallesDelPernoctantePorPernoctaneUID } from '../../../../../src/application/administracion/reservas/detallesReserva/pernoctantes/detallesDelPernoctantePorPernoctaneUID.mjs';
import { eliminarCheckOutAdelantado } from '../../../../../src/application/administracion/reservas/detallesReserva/pernoctantes/eliminarCheckOutAdelantado.mjs';
import { eliminarCheckIN } from '../../../../../src/application/administracion/reservas/detallesReserva/pernoctantes/eliminarCheckIN.mjs';
import { eliminarPernoctanteReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/pernoctantes/eliminarPernoctanteReserva.mjs';

describe('pernoctantes in bookins', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    let pernoctanteUID
    let habitacionUID
    let apartamentoUID

    const testingVI = "testingpernocatntereserve"
    const apartamentoIDV = "apartmenttestingpernocatntereserve"
    const apartamentoUI = "Apartamento temporal creado testing pernocante"
    const habitacionIDV = "roomtestingpernocatntereserve"
    const habitacionUI = "Habitacion temporal para testing pernocante"
    const camaIDV = "bedtestingpernocante"
    const camaUI = "Cama temporal para testing pernocante"


    const apartamentoIDV_2 = "apartamentfortestingaddhostingtoreservepernocante"
    const apartamentoUI_2 = "Apartamento temporal creado para add apartamento en reserva pernocante"
    const habitacionIDV_2 = "temporalroomfortestingaddhostingtoreservepernocante"
    const habitacionUI_2 = "Habitacion temporal para testing add apartamento en reserva pernocante"
    const camaIDV_2 = "temporalbedfortestingaddapartamentotoreservepernocante"
    const camaUI_2 = "Cama temporal para testing de add apartamento en reserva pernocante"


    const fakeClient = {
        nombre: "fakeName",
        primerApellido: "fakeLastName",
        segundoApellido: "fakeLastSeconName",
        pasaporte: "passportFake",
        telefono: "122333411",
        correoElectronico: "fake@mail.com",
        notas: "fakeNoteText",
    }

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarClientePorTestingVI(testingVI)

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

        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV_2,
            apartamentoUI: apartamentoUI_2,
            habitacionIDV: habitacionIDV_2,
            habitacionUI: habitacionUI_2,
            camaIDV: camaIDV_2,
            camaUI: camaUI_2,
        })


        // Crear reserva
        const reserva = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"

            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID


        const m = {
            body: {
                reservaUID: String(reservaUID),
                apartamentoIDV: apartamentoIDV_2
            },
            session: fakeAdminSession
        }
        const response = await anadirApartamentoReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        apartamentoUID = response.nuevoUID
    })

    test('add room to apartment to reserve with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                habitacionIDV: habitacionIDV_2,
                apartamentoUID,
            },
            session: fakeAdminSession
        }
        const response = await anadirHabitacionAlApartamentoEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        habitacionUID = response.nuevoUID
    })

    test('add client to room as pernoctane with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                habitacionUID: habitacionUID,
                //apartamentoUID,
                ...fakeClient
            },
            session: fakeAdminSession
        }
        const response = await crearClienteDesdeReservaYAnadirloAreserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        pernoctanteUID = response.nuevoUIDPernoctante
    })

    test('confirm date of checkIn with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pernoctanteUID: String(pernoctanteUID),
                fechaCheckIn: "2026-10-11"
            },
            session: fakeAdminSession
        }
        const response = await confirmarFechaCheckIn(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('confirm date of checkout with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pernoctanteUID: String(pernoctanteUID),
                fechaCheckOut: "2026-10-12"
            },
            session: fakeAdminSession
        }
        const response = await confirmarFechaCheckOutAdelantado(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get details of person by pernoctanteUID of checkout with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pernoctanteUID: String(pernoctanteUID),
            },
            session: fakeAdminSession
        }
        const response = await detallesDelPernoctantePorPernoctaneUID(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete date of checkout with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pernoctanteUID: String(pernoctanteUID),
            },
            session: fakeAdminSession
        }
        const response = await eliminarCheckOutAdelantado(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete date of checkin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pernoctanteUID: String(pernoctanteUID),
            },
            session: fakeAdminSession
        }
        const response = await eliminarCheckIN(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete pernoctante of bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                pernoctanteUID: String(pernoctanteUID),
                tipoEliminacion: "reserva"
            },
            session: fakeAdminSession
        }
        const response = await eliminarPernoctanteReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2,
        })
    })

})
