
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { generarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/generarSimulacion.mjs';

describe('Generate Voltail Simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const apartamentoIDV = "apartmenttestingpricessimulador"
    const apartamentoUI = "Apartamento temporal creado testing pricessimulador"
    const habitacionIDV = "roomtestingpricessimulador"
    const habitacionUI = "Habitacion temporal para testing pricessimulador"
    const camaIDV = "bedtestingpricessimulador"
    const camaUI = "Cama temporal para testing pricessimulador"

    beforeAll(async () => {

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
    test('create initial and volatil simulation with ok', async () => {
        const m = {
            body: {
                fechaCreacion: "2026-10-10",
                fechaEntrada: "2026-10-11",
                fechaSalida: "2026-10-14",
                apartamentosIDVARRAY: [apartamentoIDV]
            },
            session: fakeAdminSession
        }
        const response = await generarSimulacion(m)
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
    })

})
