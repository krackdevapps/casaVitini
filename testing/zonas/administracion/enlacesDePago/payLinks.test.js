
import { describe, expect, test } from '@jest/globals';
import { crearNuevoEnlace } from '../../../../src/application/administracion/enlacesDePago/crearNuevoEnlace.mjs';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { eliminarEnlaceDePagoPorTestingVI } from '../../../../src/infraestructure/repository/enlacesDePago/eliminarEnlaceDePagoPorTestingVI.mjs';
import { modificarEnlace } from '../../../../src/application/administracion/enlacesDePago/modificarEnlace.mjs';
import { detallesDelEnlace } from '../../../../src/application/administracion/enlacesDePago/detallesDelEnlace.mjs';
import { obtenerEnlaces } from '../../../../src/application/administracion/enlacesDePago/obtenerEnlaces.mjs';
import { eliminarEnlace } from '../../../../src/application/administracion/enlacesDePago/eliminarEnlace.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';

describe('payLinks system', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "testingPlayLinks"
    let enlaceUID
    let reservaUID
    const apartamentoIDV = "playlinkapartamentfortesting"
    const apartamentoUI = "Apartamento temporal creado para probar los enlace de pago"
    const habitacionIDV = "temporalroomforpaylins"
    const habitacionUI = "Habitacion temporal para testing de enlaces de pago"
    const camaIDV = "temporalbedforpaylinks"
    const camaUI = "Cama temporal para testing de enlaces de pago"
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarEnlaceDePagoPorTestingVI(testingVI)

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
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
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"

            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID

    })

    test('create new pay link with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                nombreEnlace: "testing",
                cantidad: "100.00",
                horasCaducidad: null,
                descripcion: "new pay link for testing",

            },
            session: fakeAdminSession
        }
        const response = await crearNuevoEnlace(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        enlaceUID = response.enlaceUID
    })

    test('update paylink with ok', async () => {
        const m = {
            body: {
                enlaceUID,
                nombreEnlace: "testing",
                cantidad: "100.00",
                horasCaducidad: "",
                descripcion: "new pay link for testing",
            },
            session: fakeAdminSession
        }
        const response = await modificarEnlace(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get details paylink with ok', async () => {
        const m = {
            body: {
                enlaceUID
            },
            session: fakeAdminSession
        }
        const response = await detallesDelEnlace(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all paylinks  with ok', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerEnlaces(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('delete paylinks with ok', async () => {
        const m = {
            body: {
                enlaceUID
            },
            session: fakeAdminSession
        }
        const response = await eliminarEnlace(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    afterAll(async () => {
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarEnlaceDePagoPorTestingVI(testingVI)

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

    });

})
