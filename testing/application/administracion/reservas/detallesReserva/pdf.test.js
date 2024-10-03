
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { pdfReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/miscelanea/pdfReserva.mjs';
import { crearTitular } from '../../../../../src/application/administracion/reservas/detallesReserva/gestionTitular/crearTitular.mjs';
import { eliminarClientePorTestingVI } from '../../../../../src/infraestructure/repository/clientes/eliminarClientePorTestingVI.mjs';

describe('pdf in bookins', () => {
    const fakeAdminSession = {
        usuario: "userfortesting",
        rolIDV: "administrador"
    }
    let reservaUID
    const testingVI = "testingpdfbookin"
    const apartamentoIDV = "apartmenttestingpdf"
    const apartamentoUI = "Apartamento temporal creado testing pdf"
    const habitacionIDV = "roomtestingpdf"
    const habitacionUI = "Habitacion temporal para testing pdf"
    const camaIDV = "bedtestingpdf"
    const camaUI = "Cama temporal para testing pdf"
    const holder = {
        nombre: "fakeholder",
        primerApellido: "holderlastname",
        segundoApellido: "holderlastname",
        pasaporte: "holderpassport",
        telefono: "23423234",
        correoElectronico: "holder@holdertesting.com",
        notas: "",
    }

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await eliminarClientePorTestingVI(testingVI)
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
    })
    test('create holder for booking booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ...holder
            },
            session: fakeAdminSession
        }
        const response = await crearTitular(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('generate pdf of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeAdminSession
        }
        const response = await pdfReserva(m)
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
    })

})
