
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { eliminarOfertaPorTestingVI } from '../../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { crearNuevoImpuesto } from '../../../../src/application/administracion/impuestos/crearNuevoImpuesto.mjs';
import { eliminarImpuestoPorTestingVI } from '../../../../src/infraestructure/repository/impuestos/eliminarImpuestoPorTestingVI.mjs';
import { insertarImpuestoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/impuestos/insertarImpuestoEnSimulacion.mjs';
import { insertarImpuestoDedicadoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/impuestos/insertarImpuestoDedicadoEnSimulacion.mjs';
import { eliminarImpuestoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/impuestos/eliminarImpuestoEnSimulacion.mjs';

describe('taxes of simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let simulacionUID
    let impuestoUID

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
        await eliminarImpuestoPorTestingVI(testingVI)
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
    test('create tax with ok', async () => {
        const m = {
            body: {
                nombre: "tax for testing created",
                tipoImpositivo: "100.00",
                tipoValorIDV: "porcentaje",
                entidadIDV: "reserva",
            },
            session: fakeAdminSession
        }
        const response = await crearNuevoImpuesto(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        impuestoUID = response.nuevoImpuestoUID
    })

    test('create initial and save simulation with ok', async () => {
        const m = {
            body: {
                nombre: "Simulacion temporal y volatil para testing",
                fechaCreacion: "2026-10-10",
                fechaEntrada: "2026-10-11",
                fechaSalida: "2026-10-14",
                apartamentosIDVARRAY: [apartamentoIDV],
            },
            session: fakeAdminSession
        }
        const response = await guardarSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        simulacionUID = response.simulacionUID
    })

    test('insert tax in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                impuestoUID: String(impuestoUID)
            },
            session: fakeAdminSession
        }
        const response = await insertarImpuestoEnSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert adhoc tax in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                nombreImpuesto: "tax for testing created",
                tipoImpositivo: "100.00",
                tipoValorIDV: "porcentaje",
            },
            session: fakeAdminSession
        }
        const response = await insertarImpuestoDedicadoEnSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete tax in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                impuestoUID: String(impuestoUID)

            },
            session: fakeAdminSession
        }
        const response = await eliminarImpuestoEnSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    afterAll(async () => {
        await eliminarOfertaPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)
        await eliminarImpuestoPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
