
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../logica/zonas/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';

describe('critical: control avaible apartments when creating bookins', () => {
    const testingVI = "testingcriticalavaibleapartmentwhencreatinbookins"

    const apartamentoIDV = "apartmenttestingcriticalavaibleapartmentwhencreatinbookins"
    const apartamentoUI = "Apartamento temporal testingcriticalavaibleapartmentwhencreatinbookins"
    const habitacionIDV = "testingcriticalavaibleapartmentwhencreatinbookins"
    const habitacionUI = "Habitacion temporal testingcriticalavaibleapartmentwhencreatinbookins"
    const camaIDV = "bedtestingcriticalavaibleapartmentwhencreatinbookins"
    const camaUI = "Cama temporal testingcriticalavaibleapartmentwhencreatinbookins"

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

    test('create first booking void', async () => {
        const m = {
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada"

            },
            session: fakeAdminSession
        }
        const response = await crearReservaSimpleAdministrativa(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        reservaUID = response.reservaUID
    })

    test('create booking with same range', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-10",
                    fechaSalida: "2026-10-20",
                    apartamentos: [apartamentoIDV],
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })
    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-09",
                    fechaSalida: "2026-10-11",
                    apartamentos: [apartamentoIDV],
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })
    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-19",
                    fechaSalida: "2026-10-21",
                    apartamentos: [apartamentoIDV],
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })

    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-11",
                    fechaSalida: "2026-10-19",
                    apartamentos: [apartamentoIDV],
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })


    test('create booking with range crossed', async () => {
        try {
            const m = {
                body: {
                    fechaEntrada: "2026-10-09",
                    fechaSalida: "2026-10-21",
                    apartamentos: [apartamentoIDV],
                },
                session: fakeAdminSession
            }
            const response = await crearReservaSimpleAdministrativa(m)
            expect(response).not.toBeUndefined();

        } catch (error) {
            expect(error).toBeInstanceOf(Error);
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
    });
})
