
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../logica/zonas/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../logica/repositorio/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { reconstruirDesgloseDesdeHubs } from '../../../../logica/zonas/administracion/simuladorDePrecios/contenedorFinanciero/reconstruirDesgloseDesdeHubs.mjs';
import { reconstruirDesgloseDesdeInstantaneas } from '../../../../logica/zonas/administracion/simuladorDePrecios/contenedorFinanciero/reconstruirDesgloseDesdeInstantaneas.mjs';

describe('rebuild snapshots of simulation', () => {
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


    test('rebuil financial container from from hubs with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                palabra: "reconstruir"
            },
            session: fakeAdminSession
        }
        const response = await reconstruirDesgloseDesdeHubs(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('rebuil financial container from snapshots with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID)
            },
            session: fakeAdminSession
        }
        const response = await reconstruirDesgloseDesdeInstantaneas(m)
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
