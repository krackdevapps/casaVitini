
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { DateTime } from 'luxon';
import { eliminarConfiguracionDeAlojamiento } from '../../src/application/administracion/arquitectura/configuraciones/eliminarConfiguracionDeAlojamiento.mjs';
import { reconstruirDesgloseDesdeInstantaneas as rcddi_reservas } from '../../src/application/administracion/reservas/detallesReserva/contenedorFinanciero/reconstruirDesgloseDesdeInstantaneas.mjs';
import { guardarSimulacion } from '../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';

describe('critical: entityAndConfigHostingValidation', () => {
    const testingVI = "testingcriticalavaibleapartmentwhencreatinbookins"

    const apartamentoIDV = "apartmenttestingcriticalavaibleapartmentwhencreatinbookins"
    const apartamentoUI = "Apartamento temporal testingcriticalavaibleapartmentwhencreatinbookins"
    const habitacionIDV = "testingcriticalavaibleapartmentwhencreatinbookins"
    const habitacionUI = "Habitacion temporal testingcriticalavaibleapartmentwhencreatinbookins"
    const camaIDV = "bedtestingcriticalavaibleapartmentwhencreatinbookins"
    const camaUI = "Cama temporal testingcriticalavaibleapartmentwhencreatinbookins"

    let reservaUID
    let simulacionUID
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
        await eliminarSimulacionPorTestingVI(testingVI)
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







    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioVirutal_futuro = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    const fechaFinalVirtual_futuro = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();

    const fechaCreacionSimulacion = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 5 }).toISODate();

    const fechaInicioVirutal_pasado = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 4 }).toISODate();
    const fechaFinalVirtual_pasado = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 3 }).toISODate();

    test('create booking in future with configuration added', async () => {
        const m = {
            body: {
                fechaEntrada: fechaInicioVirutal_futuro,
                fechaSalida: fechaFinalVirtual_futuro,
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
    })
    test('delete configuracion hosting with ok', async () => {
        try {
            const makeEntity = {
                body: {
                    apartamentoIDV
                },
                session: fakeAdminSession
            }
            const response = await eliminarConfiguracionDeAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
            expect(typeof response).toBe('object');
            expect(response).toHaveProperty('ok');

        } catch (error) {
            expect(error).toBeInstanceOf(Object);
            expect(error.error).toBe('No se puede borrar esta configuración de alojamiento porque está en reservas activas presentes o futuras. Puedes modificar completamente esta configuración de alojamiento pero no borrarla por temas de integridad. Si esta configuración de alojamiento no estuviera en ninguna reserva activa, sí se podría borrar.');
        }
    })

    test('create booking in past with configuration added', async () => {
        await eliminarReservaPorTestingVI(testingVI)
        const m = {
            body: {
                fechaEntrada: fechaInicioVirutal_pasado,
                fechaSalida: fechaFinalVirtual_pasado,
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


    test('create simulation with configutation added', async () => {
        const m = {
            body: {
                nombre: "Simulacion temporal y volatil para testing",




            },
            session: fakeAdminSession
        }
        const response = await guardarSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        simulacionUID = response.simulacionUID
    })

    test('delete configuracion hosting with ok', async () => {
        const makeEntity = {
            body: {
                apartamentoIDV
            },
            session: fakeAdminSession
        }
        const response = await eliminarConfiguracionDeAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('remake financiar container from snapshots with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID)
            },
            session: fakeAdminSession
        }
        const response = await rcddi_reservas(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await eliminarReservaPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)

    });
})
