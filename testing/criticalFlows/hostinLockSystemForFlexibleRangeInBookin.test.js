
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearNuevoBloqueo } from '../../src/application/administracion/bloqueos/crearNuevoBloqueo.mjs';
import { eliminarBloqueoPorTestingVI } from '../../src/infraestructure/repository/bloqueos/eliminarBloqueoPorTestingVI.mjs';
import { DateTime } from 'luxon';
import { obtenerElasticidadDelRango } from '../../src/application/administracion/reservas/detallesReserva/global/obtenerElasticidadDelRango.mjs';
import { crearReservaSimpleAdministrativa } from '../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { confirmarModificarFechaReserva } from '../../src/application/administracion/reservas/detallesReserva/global/confirmarModificarFechaReserva.mjs';

describe('critical: hostin lock system for flexible range in bookin', () => {
    const testingVI = "testingbookinswithlocks"

    const apartamentoIDV = "apartamentobloqueado"
    const apartamentoUI = "Apartamento temporal bloqueado"
    const habitacionIDV = "hab"
    const habitacionUI = "hab"
    const camaIDV = "cama"
    const camaUI = "camauno"

    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioReserva = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 10 }).toISODate();
    const fechaFinalReserva = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 12 }).toISODate();

    const fechaInicioBloqueo_pasado = DateTime.fromISO(fechaInicioReserva).minus({ days: 4 }).toISODate();
    const fechaFinalBloqueo_pasado = DateTime.fromISO(fechaInicioReserva).minus({ days: 2 }).toISODate();

    const fechaInicioBloqueo_futuro = DateTime.fromISO(fechaFinalReserva).plus({ days: 2 }).toISODate();
    const fechaFinalBloqueo_futuro = DateTime.fromISO(fechaFinalReserva).plus({ days: 4 }).toISODate();

    const mesEntrada = DateTime.fromISO(fechaInicioReserva).month
    const anoEntrada = DateTime.fromISO(fechaInicioReserva).year

    const mesSalida = DateTime.fromISO(fechaFinalReserva).month
    const anoSalida = DateTime.fromISO(fechaFinalReserva).year

    let reservaUID
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    beforeAll(async () => {
        await eliminarBloqueoPorTestingVI(testingVI)

        process.env.TESTINGVI = testingVI
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
    })

    test('Insert lock before entry date', async () => {
        const response = await crearNuevoBloqueo({
            body: {
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV,
                fechaInicio: fechaInicioBloqueo_pasado,
                fechaFin: fechaFinalBloqueo_pasado,
                tipoBloqueoIDV: "rangoTemporal",
                motivo: "Bloqueo creado para testing en el pasado"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('Insert lock after departura date', async () => {
        const response = await crearNuevoBloqueo({
            body: {
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV,
                fechaInicio: fechaInicioBloqueo_futuro,
                fechaFin: fechaFinalBloqueo_futuro,
                tipoBloqueoIDV: "rangoTemporal",
                motivo: "Bloqueo creado para testing en el futuro"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('confirm bookin', async () => {
        const reserva = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: fechaInicioReserva,
                fechaSalida: fechaFinalReserva,
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"
            },
            session: fakeAdminSession
        })

        expect(reserva).not.toBeUndefined();
        expect(typeof reserva).toBe('object');
        expect(reserva).toHaveProperty('ok');
        reservaUID = reserva.reservaUID
    })


    // Presentar rangom flexible entrada
    test('get flexible range for update entrance data of bookin', async () => {

        const response = await obtenerElasticidadDelRango({
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "pasado",
                mesCalendario: String(mesEntrada),
                anoCalendario: String(anoEntrada)
            },
            session: fakeAdminSession
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        expect(response.origen).toMatch(/bloqueo/);
        expect(response).toHaveProperty('limitePasado', fechaFinalBloqueo_pasado);
    })

    // Presentar rangom flexible salida
    // Presentar rangom flexible entrada
    test('get flexible range for update departure data of bookin', async () => {

        const response = await obtenerElasticidadDelRango({
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "futuro",
                mesCalendario: String(mesSalida),
                anoCalendario: String(anoSalida)
            },
            session: fakeAdminSession
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        expect(response.origen).toMatch(/bloqueo/);
        expect(response).toHaveProperty('limiteFuturo', fechaInicioBloqueo_futuro);
    })

    // Confirmar rango flexible entrada
    // Presentar rangom flexible entrada
    test('confirm flexible range for update entrance data of bookin', async () => {
        try {
            await confirmarModificarFechaReserva({
                body: {
                    reservaUID: String(reservaUID),
                    sentidoRango: "pasado",
                    fechaSolicitada_ISO: String(fechaFinalBloqueo_pasado)
                },
                session: fakeAdminSession
            })
        } catch (error) {

            expect(error).not.toBeUndefined();
            expect(typeof error).toBe('object');
            expect(error.origen).toMatch(/bloqueo/);
            expect(error).toHaveProperty('limitePasado', fechaFinalBloqueo_pasado);
        }
    })

    // Confirmar rangom flexible salida
    test('confirm flexible range for update departure data of bookin', async () => {
        try {
            await confirmarModificarFechaReserva({
                body: {
                    reservaUID: String(reservaUID),
                    sentidoRango: "futuro",
                    fechaSolicitada_ISO: String(fechaInicioBloqueo_futuro)
                },
                session: fakeAdminSession
            })
        } catch (error) {

            expect(error).not.toBeUndefined();
            expect(typeof error).toBe('object');
            expect(error.origen).toMatch(/bloqueo/);
            expect(error).toHaveProperty('limiteFuturo', fechaInicioBloqueo_futuro);
        }
    })


    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarBloqueoPorTestingVI(testingVI)

    });
})
