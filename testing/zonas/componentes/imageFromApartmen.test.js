
import { describe, expect, test } from '@jest/globals';
import { imagenDelApartamento } from '../../../src/application/componentes/imagenDelApartamento.mjs';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';

describe('Image from apartmen', () => {
    const apartamentoIDV = "apartmenttestingimages"
    const apartamentoUI = "Apartamento temporal creado para add apartamento en testingimages"
    const habitacionIDV = "temporalroomtestingimages"
    const habitacionUI = "Habitacion temporal para testing testingimages"
    const camaIDV = "temporalbedtestingimages"
    const camaUI = "Cama temporal para testing testingimages"

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
    test('get data of public view', async () => {
        const m = {
            body: {
                apartamentoIDV
            }
        }
        const response = await imagenDelApartamento(m)
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

    });

})
