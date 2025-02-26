
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { eliminarOfertaPorTestingVI } from '../../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { actualizarSimulacionPorDataGlobal } from '../../../../src/application/administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal.mjs';
import { insertarAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/alojamiento/insertarAlojamientoEnSimulacion.mjs';
import { eliminarAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/alojamiento/eliminarAlojamientoEnSimulacion.mjs';

describe('hosting of simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let simulacionUID

    const testingVI = "taxestestinginsimulation"
    const apartamentoIDV = "apartmenttaxestestinginsimulation"
    const apartamentoUI = "Apartamento temporal creado testing taxestestinginsimulation"
    const habitacionIDV = "roomtaxestestinginsimulation"
    const habitacionUI = "Habitacion temporal para testing taxestestinginsimulation"
    const camaIDV = "bedttaxestestinginsimulation"
    const camaUI = "Cama temporal para testing taxestestinginsimulation"


    const apartamentoIDV_2 = "apartmenttaxestestinginsimulationdos"
    const apartamentoUI_2 = "Apartamento temporal creado testing taxestestinginsimulationdos"
    const habitacionIDV_2 = "roomtaxestestinginsimulationdos"
    const habitacionUI_2 = "Habitacion temporal para testing taxestestinginsimulationdos "
    const camaIDV_2 = "bedttaxestestinginsimulationdos"
    const camaUI_2 = "Cama temporal para testing taxestestinginsimulationdos"


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

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2
        })
        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV_2,
            apartamentoUI: apartamentoUI_2,
            habitacionIDV: habitacionIDV_2,
            habitacionUI: habitacionUI_2,
            camaIDV: camaIDV_2,
            camaUI: camaUI_2,
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
    test('insert hostin in simulation with error', async () => {



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
    test('insert hostin in simulation with ok', async () => {
        const response = await insertarAlojamientoEnSimulacion({
            body: {
                simulacionUID: String(simulacionUID),
                apartamentoIDV: String(apartamentoIDV_2)
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete hostin in simulation with ok', async () => {
        const response = await eliminarAlojamientoEnSimulacion({
            body: {
                simulacionUID: String(simulacionUID),
                apartamentoIDV: String(apartamentoIDV)

            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarOfertaPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2
        })
    })

})
