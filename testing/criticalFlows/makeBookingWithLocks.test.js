
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { crearNuevoBloqueo } from '../../src/application/administracion/bloqueos/crearNuevoBloqueo.mjs';
import { eliminarBloqueoPorTestingVI } from '../../src/infraestructure/repository/bloqueos/eliminarBloqueoPorTestingVI.mjs';

describe('critical: control avaible apartments when creating bookins withd locks', () => {
    const testingVI = "testingbookinswithlocks"

    const apartamentoIDV = "apartmenttestingbookinswithlocks"
    const apartamentoUI = "Apartamento temporal testingbookinswithlocks"
    const habitacionIDV = "testingbookinswithlocks"
    const habitacionUI = "Habitacion temporal testingbookinswithlocks"
    const camaIDV = "bedtestingbookinswithlocks"
    const camaUI = "Cama temporal testingbookinswithlocks"

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

    test('insert new apartmen lock by temporal range with ok', async () => {
        const newLock = {
            body: {
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV,
                fechaInicio: "2026-10-10",
                fechaFin: "2026-10-20",
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

    test('create booking with same range', async () => {
        try {
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

        } catch (error) {
            expect(error).toHaveProperty('code', 'hostingNoAvaible');
            const apartmentosNoDisponbiles = error.apartamentosDisponibles
            expect(apartmentosNoDisponbiles).not.toContain(apartamentoIDV);            }
    })
    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-09",
                    fechaSalida: "2026-10-11",
                    apartamentos: [apartamentoIDV],
                    estadoInicialIDV: "confirmada",
                    estadoInicialOfertasIDV: "noAplicarOfertas"
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toHaveProperty('code', 'hostingNoAvaible');
            const apartmentosNoDisponbiles = error.apartamentosDisponibles
            expect(apartmentosNoDisponbiles).not.toContain(apartamentoIDV);            }
    })
    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-19",
                    fechaSalida: "2026-10-21",
                    apartamentos: [apartamentoIDV],
                    estadoInicialIDV: "confirmada",
                    estadoInicialOfertasIDV: "noAplicarOfertas"
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toHaveProperty('code', 'hostingNoAvaible');
            const apartmentosNoDisponbiles = error.apartamentosDisponibles
            expect(apartmentosNoDisponbiles).not.toContain(apartamentoIDV);            }
    })

    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-11",
                    fechaSalida: "2026-10-19",
                    apartamentos: [apartamentoIDV],
                    estadoInicialIDV: "confirmada",
                    estadoInicialOfertasIDV: "noAplicarOfertas"
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toHaveProperty('code', 'hostingNoAvaible');
            const apartmentosNoDisponbiles = error.apartamentosDisponibles
            expect(apartmentosNoDisponbiles).not.toContain(apartamentoIDV);            }
    })


    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-09",
                    fechaSalida: "2026-10-21",
                    apartamentos: [apartamentoIDV],
                    estadoInicialIDV: "confirmada",
                    estadoInicialOfertasIDV: "noAplicarOfertas"
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toHaveProperty('code', 'hostingNoAvaible');
            const apartmentosNoDisponbiles = error.apartamentosDisponibles
            expect(apartmentosNoDisponbiles).not.toContain(apartamentoIDV);            }
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
