
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { crearNuevoBloqueo } from '../../src/application/administracion/bloqueos/crearNuevoBloqueo.mjs';
import { eliminarBloqueoPorTestingVI } from '../../src/infraestructure/repository/bloqueos/eliminarBloqueoPorTestingVI.mjs';
import { DateTime } from 'luxon';
import { apartamentosDisponiblesAdministracion } from '../../src/application/administracion/reservas/nuevaReserva/apartamentosDisponiblesAdministracion.mjs';
import { apartamentosDisponiblesPublico } from '../../src/application/plaza/reservas/apartamentosDisponiblesPublico.mjs';
import { preConfirmarReserva } from '../../src/application/plaza/reservas/preConfirmarReserva.mjs';
import { apartamentosDisponiblesParaAnadirAReserva } from '../../src/application/administracion/reservas/detallesReserva/alojamiento/apartamentosDisponiblesParaAnadirAReserva.mjs';
import { anadirApartamentoReserva } from '../../src/application/administracion/reservas/detallesReserva/alojamiento/anadirApartamentoReserva.mjs';

describe('critical: hosting locks system', () => {

    const testingVI = "testingbookinswithlocks"

    const apartamentoIDV = "apartamentotemporalsinbloqueo"
    const apartamentoUI = "Apartamento temporal SIN bloqueado"
    const habitacionIDV = "hab"
    const habitacionUI = "hab"
    const camaIDV = "cama"
    const camaUI = "camauno"


    const apartamentoIDV_conBloqueo = "apartamentotemporalconbloqueo"
    const apartamentoUI_conBloqueo = "Apartamento temporal CON bloqueo"
    const habitacionIDV_conBloqueo = "habdos"
    const habitacionUI_conBloqueo = "habitacion dos"
    const camaIDV_conBloqueo = "camados"
    const camaUI_conBloqueo = "camados"

    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioReserva = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 10 }).toISODate();
    const fechaFinalReserva = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 12 }).toISODate();

    const fechaInicioBloqueo = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 10 }).toISODate();
    const fechaFinalBloqueo = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 12 }).toISODate();

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

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_conBloqueo,
            habitacionIDV: habitacionIDV_conBloqueo,
            camaIDV: camaIDV_conBloqueo
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

        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV_conBloqueo,
            apartamentoUI: apartamentoUI_conBloqueo,
            habitacionIDV: habitacionIDV_conBloqueo,
            habitacionUI: habitacionUI_conBloqueo,
            camaIDV: camaIDV_conBloqueo,
            camaUI: camaUI_conBloqueo,
        })
    })


    test('insert new temporal lock with ok', async () => {
        const newLock = {
            body: {
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV_conBloqueo,
                fechaInicio: fechaInicioBloqueo,
                fechaFin: fechaFinalBloqueo,
                tipoBloqueoIDV: "rangoTemporal",
                motivo: "Bloqueo creado para testing"
            },
            session: fakeAdminSession
        }
        const response = await crearNuevoBloqueo(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })


    // Apartamentos diponibes para reserva publica y privada
    test('get avaibles apartments for new administrative booking', async () => {
        const response = await apartamentosDisponiblesAdministracion({
            body: {
                fechaEntrada: fechaInicioReserva,
                fechaSalida: fechaFinalReserva,
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        const apartamentosNoDisponibles = response.ok.apartamentosNoDisponibles
        expect(apartamentosNoDisponibles).toContain(apartamentoIDV_conBloqueo);
    })

    test('get avaibles apartments for new public booking', async () => {
        const response = await apartamentosDisponiblesPublico({
            body: {
                fechaEntrada: fechaInicioReserva,
                fechaSalida: fechaFinalReserva,
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        const apartamentosDisponibles = response.ok.apartamentosDisponibles
        const apartamentosIDVDisponbiles = Object.keys(apartamentosDisponibles)
        expect(apartamentosIDVDisponbiles).toContain(apartamentoIDV);
        expect(apartamentosIDVDisponbiles).not.toContain(apartamentoIDV_conBloqueo);
    })

    test('confirm bookin from DMZ with error by locked hosting', async () => {
        try {
            await preConfirmarReserva({
                body: {
                    codigoDescuento: [],
                    reserva: {
                        fechaEntrada: fechaInicioReserva,
                        fechaSalida: fechaFinalReserva,
                        alojamiento: {
                            [apartamentoIDV_conBloqueo]: {
                                habitaciones: {
                                    [habitacionIDV_conBloqueo]: {
                                        camaSeleccionada: {
                                            camaIDV: camaIDV_conBloqueo
                                        }
                                    }
                                }
                            }
                        },
                        titular: {
                            nombreTitular: "test",
                            correoTitular: "test@test.com",
                            telefonoTitular: "3333",
                            codigoInternacional: "+1"
                        }
                    }
                }
            })
        } catch (error) {
            expect(error).not.toBeUndefined();
            expect(typeof error).toBe('object');
            expect(error).toHaveProperty('error');
            expect(error).toHaveProperty('code');
            expect(error.code).toMatch(/hotingNoAvaible/)
            const apartamentosDisponibles = error.apartamentosDisponibles
            const apartamentosIDVDisponbiles = Object.keys(apartamentosDisponibles)
            expect(apartamentosIDVDisponbiles).not.toContain(apartamentoIDV_conBloqueo);
        }

    })
    test('create new booking with error by hosting locked', async () => {
        try {
            await crearReservaSimpleAdministrativa({
                body: {
                    fechaEntrada: fechaInicioReserva,
                    fechaSalida: fechaFinalReserva,
                    apartamentos: [apartamentoIDV_conBloqueo],
                    estadoInicialIDV: "confirmada",
                    estadoInicialOfertasIDV: "noAplicarOfertas"

                },
                session: fakeAdminSession
            })

        } catch (error) {
            expect(error).not.toBeUndefined();
            expect(typeof error).toBe('object');
            expect(error).toHaveProperty('error');
            expect(error).toHaveProperty('code');
            expect(error.code).toMatch(/hostingNoAvaible/);

            const apartamentosDisponibles = error.apartamentosDisponibles
            const apartamentosIDVDisponbiles = Object.keys(apartamentosDisponibles)
            expect(apartamentosIDVDisponbiles).not.toContain(apartamentoIDV_conBloqueo);
        }

    })

    test('create new booking with ok by hosting without lock', async () => {

        const response = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: fechaInicioReserva,
                fechaSalida: fechaFinalReserva,
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"

            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        reservaUID = response.reservaUID
    })

    test('get avaible booking for booking actived', async () => {

        const response = await apartamentosDisponiblesParaAnadirAReserva({
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        const apartamentosNoDisponibles = response.ok.apartamentosNoDisponibles
        const apartamentosIDVNoDisponbiles = apartamentosNoDisponibles.map(a => a.apartamentoIDV)
        expect(apartamentosIDVNoDisponbiles).toContain(apartamentoIDV_conBloqueo)

    })

    test('insert unavaible hosting in booking actived', async () => {
        try {
            await anadirApartamentoReserva({
                body: {
                    reservaUID: String(reservaUID),
                    apartamentoIDV: apartamentoIDV_conBloqueo
                },
                session: fakeAdminSession
            })
        } catch (error) {
            expect(error).not.toBeUndefined();
            expect(typeof error).toBe('object');
            expect(error).toHaveProperty('code');
            expect(error).toHaveProperty('apartamentoIDV');
            expect(error.code).toMatch(/hostingNoAvaible/);
            expect(error.apartamentoIDV).toBe(apartamentoIDV_conBloqueo);
        }
    })


    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_conBloqueo,
            habitacionIDV: habitacionIDV_conBloqueo,
            camaIDV: camaIDV_conBloqueo
        })
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarBloqueoPorTestingVI(testingVI)

    });
})
