
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../logica/zonas/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { crearTitular } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/gestionTitular/crearTitular.mjs';
import { eliminarClientePorTestingVI } from '../../../../../logica/repositorio/clientes/eliminarClientePorTestingVI.mjs';
import { crearCliente } from '../../../../../logica/zonas/administracion/clientes/crearCliente.mjs';
import { asociarTitular } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/gestionTitular/asociarTitular.mjs';
import { desasociarClienteComoTitular } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/gestionTitular/desasociarClienteComoTitular.mjs';

describe('holder in bookins', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    let clienteUID
    const testingVI = "testingholdinreserve"
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"

    const holder = {
        nombre: "fakeholder",
        primerApellido: "holderlastname",
        segundoApellido: "holderlastname",
        pasaporte: "holderpassport",
        telefono: "23423234",
        correoElectronico: "holder@holdertesting.com",
        notas: "",
    }
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

    test('create new client with ok', async () => {
        const newClient = {
            body: {
                ...fakeClient
            },
            session: fakeAdminSession
        }
        const response = await crearCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID = response.nuevoUIDCliente
    })

    test('associate new client as holder in booking with ok', async () => {
        const newClient = {
            body: {
                reservaUID: String(reservaUID),
                clienteUID
            },
            session: fakeAdminSession
        }
        const response = await asociarTitular(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID = response.nuevoUIDCliente
    })

    test('deassociate new client as holder in booking with ok', async () => {
        const newClient = {
            body: {
                reservaUID: String(reservaUID),
                clienteUID
            },
            session: fakeAdminSession
        }
        const response = await desasociarClienteComoTitular(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID = response.nuevoUIDCliente
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
