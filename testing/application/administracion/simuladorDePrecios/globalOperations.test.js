
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { detallesSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/detallesSimulacion.mjs';
import { actualizarNombreSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/actualizarNombreSimulacion.mjs';
import { listaSimulacionesPaginados } from '../../../../src/application/administracion/simuladorDePrecios/listaSimulacionesPaginados.mjs';
import { eliminarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/eliminarSimulacion.mjs';
import { actualizarSimulacionPorDataGlobal } from '../../../../src/application/administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal.mjs';
import { insertarAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/alojamiento/insertarAlojamientoEnSimulacion.mjs';

describe('Global Operations Simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let simulacionUID
    const testingVI = "globaloperations"
    const apartamentoIDV = "apartmenttestingpricessimulador"
    const apartamentoUI = "Apartamento temporal creado testing pricessimulador"
    const habitacionIDV = "roomtestingpricessimulador"
    const habitacionUI = "Habitacion temporal para testing pricessimulador"
    const camaIDV = "bedtestingpricessimulador"
    const camaUI = "Cama temporal para testing pricessimulador"

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarSimulacionPorTestingVI(testingVI)
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

    })
    test('create initial and save void simulation with ok', async () => {
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

    test('get detail of void simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
            },
            session: fakeAdminSession
        }
        const response = await detallesSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert hostin in simulation with ok', async () => {
        try {
            const response = await insertarAlojamientoEnSimulacion({
                body: {
                    simulacionUID: String(simulacionUID),
                    apartamentoIDV: String(apartamentoIDV)
                },
                session: fakeAdminSession
            })
        } catch (error) {
            expect(error).not.toBeUndefined();
            expect(typeof error).toBe('object');
            expect(error).toHaveProperty('info');
        }
    })
    test('insert global data in simulation created with ok', async () => {
        const m = {
            body: {
                simulacionUID: simulacionUID,
                fechaCreacion: "2026-10-10",
                fechaEntrada: "2026-10-11",
                fechaSalida: "2026-10-14",
                zonaIDV: "global",
            },
            session: fakeAdminSession
        }
        const response = await actualizarSimulacionPorDataGlobal(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get detail simulation with global data with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
            },
            session: fakeAdminSession
        }
        const response = await detallesSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update name of simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                nombre: "Nombre actualizado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarNombreSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('list all simulations with pagination with ok', async () => {
        const m = {
            body: {
                pagina: 1
            },
            session: fakeAdminSession
        }
        const response = await listaSimulacionesPaginados(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
            },
            session: fakeAdminSession
        }
        const response = await eliminarSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarSimulacionPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
