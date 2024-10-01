
import { describe, expect, test } from '@jest/globals';
import { resolverQR } from '../../../src/application/componentes/resolverQR.mjs';
import { eliminarReservaPorTestingVI } from '../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { crearReservaSimpleAdministrativa } from '../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';

describe('qr resolver', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    const testingVI = "testingtaxesinbookin"
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarReservaPorTestingVI(testingVI)
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
    test('get booking by qr decoded', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                codigoIDV: "reserva"
            },
            session: fakeAdminSession
        }
        const response = await resolverQR(m)
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
