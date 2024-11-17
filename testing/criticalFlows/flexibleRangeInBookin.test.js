
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { obtenerElasticidadDelRango } from '../../src/application/administracion/reservas/detallesReserva/global/obtenerElasticidadDelRango.mjs';
import { confirmarModificarFechaReserva } from '../../src/application/administracion/reservas/detallesReserva/global/confirmarModificarFechaReserva.mjs';

describe('critical: flexible global date range bookins', () => {
    const testingVI = "testingflexibledaterangebookin"
    const apartamentoIDV = "apartmentflexibledaterangebookin"
    const apartamentoUI = "Apartamento temporal flexibledaterangebookin"
    const habitacionIDV = "flexibledaterangebookin"
    const habitacionUI = "Habitacion temporal flexibledaterangebookin"
    const camaIDV = "bedflexibledaterangebookin"
    const camaUI = "Cama temporal flexibledaterangebookin"

    let reservaUID
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    beforeAll(async () => {
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

    test('create first booking', async () => {
        const m = {
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"
            },
            session: fakeAdminSession
        }
        const response = await crearReservaSimpleAdministrativa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        reservaUID = response.reservaUID
    })

    test('create second booking', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-02",
                    fechaSalida: "2026-10-08",
                    apartamentos: [apartamentoIDV],
                    estadoInicialIDV: "confirmada",
                    estadoInicialOfertasIDV: "noAplicarOfertas"


                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })

    test('create third booking', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-22",
                    fechaSalida: "2026-10-28",
                    apartamentos: [apartamentoIDV],
                    estadoInicialIDV: "confirmada",
                    estadoInicialOfertasIDV: "noAplicarOfertas"


                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })
    test('get elasticy of past global date range of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "pasado",
                mesCalendario: "10",
                anoCalendario: "2026"

            },
            session: fakeAdminSession
        }
        const response = await obtenerElasticidadDelRango(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        expect(response.ok).toBe('rangoPasadoLimitado');
        expect(response.limitePasado).toBe('2026-10-07');
    })
    test('get elasticy of future global date range of booking with ok', async () => {
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
        expect(response.ok).toBe('rangoFuturoLimitado');
        expect(response.limiteFuturo).toBe('2026-10-23');
    })
    test('get elasticy of past global date range of before month booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "pasado",
                mesCalendario: "09",
                anoCalendario: "2026"
            },
            session: fakeAdminSession
        }
        const response = await obtenerElasticidadDelRango(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        expect(response.ok).toBe('rangoPasadoLimitado');
        expect(response.limitePasado).toBe('2026-10-07');
    })
    test('get elasticy of future global date range of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "futuro",
                mesCalendario: "11",
                anoCalendario: "2026"
            },
            session: fakeAdminSession
        }

        const response = await obtenerElasticidadDelRango(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        expect(response.ok).toBe('rangoFuturoLimitado');
        expect(response.limiteFuturo).toBe('2026-10-23');
    })
    test('set elasticy of past range of booking with error', async () => {

        try {
            const m = {
                body: {
                    reservaUID: String(reservaUID),
                    sentidoRango: "pasado",
                    fechaSolicitada_ISO: "2026-10-07",

                },
                session: fakeAdminSession
            }
            const response = await confirmarModificarFechaReserva(m)
            expect(response).not.toBeUndefined();
        } catch (error) {
            expect(error).toHaveProperty('limitePasado', '2026-10-07');
        }
    })
    test('set elasticy of future range of booking with error', async () => {
        try {
            const m = {
                body: {
                    reservaUID: String(reservaUID),
                    sentidoRango: "futuro",
                    fechaSolicitada_ISO: "2026-10-23",

                },
                session: fakeAdminSession
            }
            const response = await confirmarModificarFechaReserva(m)
            expect(response).not.toBeUndefined();
        } catch (error) {
            expect(error).toHaveProperty('limiteFuturo', '2026-10-23');

        }
    })

    test('set elasticy of past range of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "pasado",
                fechaSolicitada_ISO: "2026-10-08",

            },
            session: fakeAdminSession
        }
        const response = await confirmarModificarFechaReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        expect(response.fecha_ISO).toBe("2026-10-08");
    })
    test('set elasticy of future range of booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                sentidoRango: "futuro",
                fechaSolicitada_ISO: "2026-10-22",

            },
            session: fakeAdminSession
        }
        const response = await confirmarModificarFechaReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        expect(response.fecha_ISO).toBe("2026-10-22");
    })

    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await eliminarReservaPorTestingVI(testingVI)
    });
})
