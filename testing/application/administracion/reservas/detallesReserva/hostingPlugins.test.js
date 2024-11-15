
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarImpuestoPorTestingVI } from '../../../../../src/infraestructure/repository/impuestos/eliminarImpuestoPorTestingVI.mjs';
import { insertarComplementoAlojamientoEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/complementosDeAlojamiento/insertarComplementoAlojamientoEnReserva.mjs';
import { eliminarComplementoDeAlojamientoEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/complementosDeAlojamiento/eliminarComplementoDeAlojamientoEnReserva.mjs';
import { crearComplementoDeAlojamiento } from '../../../../../src/application/administracion/complementosDeAlojamiento/crearComplementoDeAlojamiento.mjs';

describe('hostin plugin in bookins', () => {
    const fakeAdminSession = {
        usuario: "userfortesting",
        rolIDV: "administrador"
    }
    let reservaUID
    let complementoUID
    let complementoUID_enReserva

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

    test('create hosting plugin with ok', async () => {
        const response = await crearComplementoDeAlojamiento({
            body: {
                apartamentoIDV: apartamentoIDV,
                complementoUI: "Complemento temporal",
                definicion: "Complemento temporal de alojamiento para testing",
                tipoPrecio: "porNoche",
                precio: "100.00",
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        complementoUID = response.nuevoComplementoUID
    })


    test('insert hostin plugin in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                complementoUID: String(complementoUID)
            },
            session: fakeAdminSession
        }
        const response = await insertarComplementoAlojamientoEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        complementoUID_enReserva = response.complementoDeAlojamiento.complementoUID
    })

    test('delete hostin plugin in booking with ok', async () => {

        const m = {
            body: {
                complementoUID_enReserva: String(complementoUID_enReserva)
            },
            session: fakeAdminSession
        }
        const response = await eliminarComplementoDeAlojamientoEnReserva(m)
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
