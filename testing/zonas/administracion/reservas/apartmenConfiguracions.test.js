
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { configuracionApartamento } from '../../../../logica/zonas/administracion/reservas/configuracionApartamento.mjs';

describe('apartment configurations in bookin', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const apartamentoIDV = "apartmenttestinggetconfigurations"
    const apartamentoUI = "Apartamento temporal creado getconfigurations"
    const habitacionIDV = "roomtestinggetconfigurations"
    const habitacionUI = "Habitacion temporal para getconfigurations"
    const camaIDV = "bedtestinggetconfigurations"
    const camaUI = "Cama temporal para testing getconfigurations"

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

    test('get configurations of apartments with ok', async () => {
        const m = {
            body: {
                apartamentos: [apartamentoIDV]
            },
            session: fakeAdminSession
        }
        const response = await configuracionApartamento(m)
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
