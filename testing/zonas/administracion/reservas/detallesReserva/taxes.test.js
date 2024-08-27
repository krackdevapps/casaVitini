
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../logica/zonas/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarImpuestoPorTestingVI } from '../../../../../logica/repositorio/impuestos/eliminarImpuestoPorTestingVI.mjs';
import { crearNuevoImpuesto } from '../../../../../logica/zonas/administracion/impuestos/crearNuevoImpuesto.mjs';
import { insertarImpuestoEnReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/impuestos/insertarImpuestoEnReserva.mjs';
import { insertarImpuestoDedicadoEnReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/impuestos/insertarImpuestoDedicadoEnReserva.mjs';
import { eliminarImpuestoEnReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/impuestos/eliminarImpuestoEnReserva.mjs';

describe('taxes in bookins', () => {
    const fakeAdminSession = {
        usuario: "userfortesting",
        rolIDV: "administrador"
    }
    let reservaUID
    let impuestoUID
    const testingVI = "testingtaxesinbookin"
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"

    

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarImpuestoPorTestingVI(testingVI)
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

    test('create tax with ok', async () => {
        const m = {
            body: {
                nombre: "tax for testing created",
                tipoImpositivo: "100.00",
                tipoValorIDV: "porcentaje",
                entidadIDV: "reserva",
            },
            session: fakeAdminSession
        }
        const response = await crearNuevoImpuesto(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        impuestoUID = response.nuevoImpuestoUID
    })

    test('insert tax in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                impuestoUID: String(impuestoUID)
            },
            session: fakeAdminSession
        }
        const response = await insertarImpuestoEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('insert tax ad hoc in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                nombreImpuesto: "tax ad hoc for testing created",
                tipoImpositivo: "100.00",
                tipoValorIDV: "porcentaje",
            },
            session: fakeAdminSession
        }
        const response = await insertarImpuestoDedicadoEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete tax in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                impuestoUID: String(impuestoUID)

            },
            session: fakeAdminSession
        }
        const response = await eliminarImpuestoEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarImpuestoPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
