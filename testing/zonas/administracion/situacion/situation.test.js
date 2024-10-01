
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { obtenerSituacion } from '../../../../src/application/administracion/situacion/obtenerSituacion.mjs';
import { detallesSituacionApartamento } from '../../../../src/application/administracion/situacion/detallesSituacionApartamento.mjs';

describe('situation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    const testingVI = "taxestestinginsimulation"
    const apartamentoIDV = "apartmenttaxestestinginsimulation"
    const apartamentoUI = "Apartamento temporal creado testing taxestestinginsimulation"
    const habitacionIDV = "roomtaxestestinginsimulation"
    const habitacionUI = "Habitacion temporal para testing taxestestinginsimulation"
    const camaIDV = "bedttaxestestinginsimulation"
    const camaUI = "Cama temporal para testing taxestestinginsimulation"

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
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
    test('get situacion', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await obtenerSituacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get situacion of apartment', async () => {
        const m = {
            body: {
                apartamentoIDV
            },
            session: fakeAdminSession
        }
        const response = await detallesSituacionApartamento(m)
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
