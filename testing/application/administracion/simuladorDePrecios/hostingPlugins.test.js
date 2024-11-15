
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { eliminarOfertaPorTestingVI } from '../../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { actualizarSimulacionPorDataGlobal } from '../../../../src/application/administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal.mjs';
import { insertarAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/alojamiento/insertarAlojamientoEnSimulacion.mjs';
import { insertarComplementoDeAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/complementosDeAlojamiento/insertarComplementoDeAlojamientoEnSimulacion.mjs';
import { crearComplementoDeAlojamiento } from '../../../../src/application/administracion/complementosDeAlojamiento/crearComplementoDeAlojamiento.mjs';
import { eliminarComplementoDeAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/complementosDeAlojamiento/eliminarComplementoDeAlojamientoEnSimulacion.mjs';

describe('hostin plugins of simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let simulacionUID
    let complementoUID
    let complementoUID_enSimulacion

    const testingVI = "taxestestinginsimulation"
    const apartamentoIDV = "apartmenttaxestestinginsimulation"
    const apartamentoUI = "Apartamento temporal creado testing taxestestinginsimulation"
    const habitacionIDV = "roomtaxestestinginsimulation"
    const habitacionUI = "Habitacion temporal para testing taxestestinginsimulation"
    const camaIDV = "bedttaxestestinginsimulation"
    const camaUI = "Cama temporal para testing taxestestinginsimulation"

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
    test('create hosting plugin with ok', async () => {
        const response = await crearComplementoDeAlojamiento({
            body: {
                apartamentoIDV: apartamentoIDV,
                complementoUI: "Complemento temporal",
                definicion: "Complemento temporal de alojamiento para testing",
                tipoPrecio: "porNoche",
                precio: "100.00",
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        complementoUID = response.nuevoComplementoUID
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

    test('insert hostin in simulation with ok', async () => {
        const response = await insertarAlojamientoEnSimulacion({
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


    test('insert global data in simulation created with ok', async () => {
        const m = {
            body: {
                simulacionUID: simulacionUID,
                fechaCreacion: "2026-10-10",
                fechaEntrada: "2026-10-11",
                fechaSalida: "2026-10-14",
                zonaIDV: "global",
                apartamentosIDVARRAY: [apartamentoIDV],
            },
            session: fakeAdminSession
        }
        const response = await actualizarSimulacionPorDataGlobal(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('insert plugin in hostin of simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                complementoUID: String(complementoUID)
            },
            session: fakeAdminSession
        }
        const response = await insertarComplementoDeAlojamientoEnSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

        complementoUID_enSimulacion = response.complementoDeAlojamiento.complementoUID
    })

    test('delete plugin in hostin of simulation with ok', async () => {
        const m = {
            body: {
                complementoUID_enSimulacion: String(complementoUID_enSimulacion),
            },
            session: fakeAdminSession
        }
        const response = await eliminarComplementoDeAlojamientoEnSimulacion(m)
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
    })

})
