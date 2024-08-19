
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../logica/zonas/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { anadirApartamentoReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/anadirApartamentoReserva.mjs';
import { anadirHabitacionAlApartamentoEnReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/anadirHabitacionAlApartamentoEnReserva.mjs';
import { crearCliente } from '../../../../../logica/zonas/administracion/clientes/crearCliente.mjs';
import { anadirPernoctanteHabitacion } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/anadirPernoctanteHabitacion.mjs';
import { apartamentosDisponiblesParaAnadirAReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/apartamentosDisponiblesParaAnadirAReserva.mjs';
import { eliminarClientePorTestingVI } from '../../../../../logica/repositorio/clientes/eliminarClientePorTestingVI.mjs';
import { cambiarPernoctanteDeHabitacion } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/cambiarPernoctanteDeHabitacion.mjs';
import { crearEntidadAlojamiento } from '../../../../../logica/zonas/administracion/arquitectura/entidades/crearEntidadAlojamiento.mjs';
import { eliminarCamaComoEntidadPorTestingVI } from '../../../../../logica/repositorio/arquitectura/entidades/cama/eliminarCamaComoEntidadPorTestingVI.mjs';
import { estadoHabitacionesApartamento } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/estadoHabitacionesApartamento.mjs';
import { gestionarCamasDeHabitacion } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/gestionarCamasDeHabitacion.mjs';
import { listarTipoCamasHabitacion } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/listarTipoCamasHabitacion.mjs';
import { eliminarCamaFisicaDeHabitacion } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/eliminarCamaFisicaDeHabitacion.mjs';
import { eliminarHabitacionReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/eliminarHabitacionReserva.mjs';
import { eliminarApartamentoReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/alojamiento/eliminarApartamentoReserva.mjs';

describe('detailsReserver', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    let habitacionUID
    const testingVI = "testingaddhostingtoreserve"
    const apartamentoIDV = "apartamentfortestingaddhostingtoreserve"
    const apartamentoUI = "Apartamento temporal creado para add apartamento en reserva"
    const habitacionIDV = "temporalroomfortestingaddhostingtoreserve"
    const habitacionUI = "Habitacion temporal para testing add apartamento en reserva"
    const camaIDV = "temporalbedfortestingaddapartamentotoreserve"
    const camaUI = "Cama temporal para testing de add apartamento en reserva"

    const apartamentoIDV_2 = "apartamentfortestingaddhostingtoreservetwo"
    const apartamentoUI_2 = "Apartamento temporal creado para add apartamento en reserva two"
    const habitacionIDV_2 = "temporalroomfortestingaddhostingtoreservetwo"
    const habitacionUI_2 = "Habitacion temporal para testing add apartamento en reserva two"
    const camaIDV_2 = "temporalbedfortestingaddapartamentotoreservetwo"
    const camaUI_2 = "Cama temporal para testing de add apartamento en reserva two"

    const camaIDV_fisica = "camafisicaparatestinghosting"

    let clienteUID
    let pernoctanteUID
    let camaFisica_UID
    let camaFisicaInsertadaEnHabitacion_UID_componenteUID
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
        await eliminarClientePorTestingVI(testingVI)
        await eliminarCamaComoEntidadPorTestingVI(testingVI)

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

    test('create second hosting architecture to add reserve with ok', async () => {

        // Añadir una seguna arquitectura de alojamineto para añadiral una vez creada la reserva
        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV_2,
            apartamentoUI: apartamentoUI_2,
            habitacionIDV: habitacionIDV_2,
            habitacionUI: habitacionUI_2,
            camaIDV: camaIDV_2,
            camaUI: camaUI_2,
        })

        // expect(response).not.toBeUndefined();
        // expect(typeof response).toBe('object');
        // expect(response).toHaveProperty('ok');
        // apartamentoUID = response.nuevoUID
    })



    let apartamentoUID
    test('add apartment to reserve with ok', async () => {
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


    test('create new client for testing hosting with ok', async () => {
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

    test('add client in room with ok', async () => {
        const newClient = {
            body: {
                reservaUID: String(reservaUID),
                habitacionUID,
                clienteUID
            },
            session: fakeAdminSession
        }
        const response = await anadirPernoctanteHabitacion(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        pernoctanteUID = response.pernoctante.componenteUID
    })

    test('apartment avaibles for adding to booking with ok', async () => {
        const newClient = {
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
            },
            session: fakeAdminSession
        }
        const response = await apartamentosDisponiblesParaAnadirAReserva(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('change room for person in booking with ok', async () => {
        const newClient = {
            body: {
                reservaUID: String(reservaUID),
                habitacionDestinoUID: habitacionUID,
                pernoctanteUID
            },
            session: fakeAdminSession
        }
        const response = await cambiarPernoctanteDeHabitacion(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('create fisical bed for room testing in booking with ok', async () => {
        const response = await crearEntidadAlojamiento({
            body: {
                tipoEntidad: "cama",
                camaUI: "cama fisica para testing",
                camaIDV: camaIDV_fisica,
                capacidad: "3",
                tipoCama: "fisica",
                testingVI
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        camaFisica_UID = response.nuevoUID
    })

    test('status rooms in apartment in booking with ok', async () => {

        const response = await estadoHabitacionesApartamento({
            body: {
                reservaUID: String(reservaUID),
                apartamentoUID
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('manage beds in rooms in apartment in booking with ok', async () => {
        const response = await gestionarCamasDeHabitacion({
            body: {
                reservaUID: String(reservaUID),
                habitacionUID,
                nuevaCamaIDV: camaIDV_fisica,
                tipoIDV: "fisica"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        camaFisicaInsertadaEnHabitacion_UID_componenteUID = response.componenteUID
    })


    test('list types of bed in room with ok', async () => {
        const response = await listarTipoCamasHabitacion({
            body: {
                apartamentoIDV,
                habitacionIDV,
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete fisical bed in room with ok', async () => {

        const response = await eliminarCamaFisicaDeHabitacion({
            body: {
                reservaUID: String(reservaUID),
                componenteUID: String(camaFisicaInsertadaEnHabitacion_UID_componenteUID),
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete roomin bookin with ok', async () => {

        const response = await eliminarHabitacionReserva({
            body: {
                reservaUID: String(reservaUID),
                habitacionUID: String(habitacionUID),
                pernoctantes: "eliminar"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('delete apartmen in bookin with ok', async () => {

        const response = await eliminarApartamentoReserva({
            body: {
                reservaUID: String(reservaUID),
                apartamentoUID: String(apartamentoUID),
                tipoBloqueo: "sinBloqueo"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })




    afterAll(async () => {
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarClientePorTestingVI(testingVI)
        await eliminarCamaComoEntidadPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        // Añadir una seguna arquitectura de alojamineto para añadiral una vez creada la reserva
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2,
        })
    });

})
