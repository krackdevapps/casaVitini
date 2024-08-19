
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../logica/zonas/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { obtenerReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/global/obtenerReserva.mjs';
import { estadoReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/global/estadoReserva.mjs';
import { actualizarEstadoReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/global/actualizarEstadoReserva.mjs';
import { obtenerElasticidadDelRango } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/global/obtenerElasticidadDelRango.mjs';
import { confirmarModificarFechaReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/global/confirmarModificarFechaReserva.mjs';
import { cancelarReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/global/cancelarReserva.mjs';
import { eliminarIrreversiblementeReserva } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/global/eliminarIrreversiblementeReserva.mjs';
import { crearCuentaDesdeAdministracion } from '../../../../../logica/zonas/administracion/usuarios/crearCuentaDesdeAdministracion.mjs';
import { eliminarUsuarioPorTestingVI } from '../../../../../logica/repositorio/usuarios/eliminarUsuarioPorTestingVI.mjs';

describe('global operations in bookins', () => {
    const fakeAdminSession = {
        usuario: "userfortesting",
        rolIDV: "administrador"
    }
    let reservaUID
    const testingVI = "testingholdinreserve"
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"


    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarUsuarioPorTestingVI(testingVI)
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
    test('get details of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                capas: ["titular"]
            },
            session: fakeAdminSession
        }
        const response = await obtenerReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get status of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeAdminSession
        }
        const response = await estadoReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update status of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                nuevoEstado: "confirmada"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get elasticy of range of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "futuro",
                mesCalendario: "10",
                anoCalendario: "2026"

            },
            session: fakeAdminSession
        }
        const response = await obtenerElasticidadDelRango(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('set elasticy of range of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "futuro",
                fechaSolicitada_ISO: "2026-10-21",

            },
            session: fakeAdminSession
        }
        const response = await confirmarModificarFechaReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('cancel booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                tipoBloqueoIDV: "sinBloqueo",
            },
            session: fakeAdminSession
        }
        const response = await cancelarReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    // Crear un usuario temporal--

    test('delete booking with ok', async () => {

        const fakeUser = {
            body: {
                usuarioIDX: fakeAdminSession.usuario,
                clave: "1234567890",
                rolIDV: "administrador",
            },
            session: fakeAdminSession
        }
        await crearCuentaDesdeAdministracion(fakeUser)


        const m = {
            body: {
                reservaUID: String(reservaUID),
                clave: "1234567890"
            },
            session: fakeAdminSession
        }
        const response = await eliminarIrreversiblementeReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    afterAll(async () => {
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
