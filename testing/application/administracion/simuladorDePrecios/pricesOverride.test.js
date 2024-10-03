
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { eliminarOfertaPorTestingVI } from '../../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { eliminarImpuestoPorTestingVI } from '../../../../src/infraestructure/repository/impuestos/eliminarImpuestoPorTestingVI.mjs';
import { actualizarSobreControlNoche } from '../../../../src/application/administracion/simuladorDePrecios/sobreControlPrecios/actualizarSobreControlNoche.mjs';
import { obtenerDetallesSobreControlNoche } from '../../../../src/application/administracion/simuladorDePrecios/sobreControlPrecios/obtenerDetallesSobreControlNoche.mjs';
import { eliminarSobreControlNoche } from '../../../../src/application/administracion/simuladorDePrecios/sobreControlPrecios/eliminarSobreControlNoche.mjs';
import { actualizarSimulacionPorDataGlobal } from '../../../../src/application/administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal.mjs';

describe('price overrride of simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let simulacionUID
    let impuestoUID

    const testingVI = "priveoverridetestinginsimulation"
    const apartamentoIDV = "apartmentpriveoverride"
    const apartamentoUI = "Apartamento temporal creado testing priveoverride"
    const habitacionIDV = "roompriveoverride"
    const habitacionUI = "Habitacion temporal para testing priveoverride"
    const camaIDV = "bedttaxespriveoverride"
    const camaUI = "Cama temporal para testing priveoverride"

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


    test('create initial and save void simulation with ok', async () => {
        const m = {
            body: {
                nombre: "Simulacion temporal y volatil para testing",
                // fechaCreacion: "2026-10-10",
                // fechaEntrada: "2026-10-11",
                // fechaSalida: "2026-10-14",
                // apartamentosIDVARRAY: [apartamentoIDV],
            },
            session: fakeAdminSession
        }
        const response = await guardarSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        simulacionUID = response.simulacionUID
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
    test('update price in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: "2026-10-11",
                tipoOperacion: "aumentarPorPorcentaje",
                valorSobreControl: "10.00"
            },
            session: fakeAdminSession
        }
        const response = await actualizarSobreControlNoche(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get price in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: "2026-10-11"
            },
            session: fakeAdminSession
        }
        const response = await obtenerDetallesSobreControlNoche(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete override price in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: "2026-10-11"
            },
            session: fakeAdminSession
        }
        const response = await eliminarSobreControlNoche(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    afterAll(async () => {
        await eliminarOfertaPorTestingVI(testingVI)
        await eliminarImpuestoPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
