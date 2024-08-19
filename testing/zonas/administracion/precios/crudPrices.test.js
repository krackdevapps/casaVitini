
import { describe, expect, test } from '@jest/globals';
import { establecerNuevoPrecioApartamento } from '../../../../logica/zonas/administracion/precios/establecerNuevoPrecioApartamento.mjs';
import { detallePrecioBaseApartamento } from '../../../../logica/zonas/administracion/precios/detallePrecioBaseApartamento.mjs';
import { listaPreciosApartamentos } from '../../../../logica/zonas/administracion/precios/listaPreciosApartamentos.mjs';
import { previsualizarPrecioApartamento } from '../../../../logica/zonas/administracion/precios/previsualizarPrecioApartamento.mjs';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';

describe('crud prices system', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const apartamentoIDV = "pricesapartamentfortesting"
    const apartamentoUI = "Apartamento temporal creado para probar los precios"
    const habitacionIDV = "temporalroomforprices"
    const habitacionUI = "Habitacion temporal para testing de los precios"
    const camaIDV = "temporalbedforprices"
    const camaUI = "Cama temporal para testing de los precios"
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

    test('update price of hosting configuracion with ok', async () => {
        const m = {
            body: {
                apartamentoIDV,
                nuevoPrecio: "99.99"
            },
            session: fakeAdminSession
        }
        const response = await establecerNuevoPrecioApartamento(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('detail of price of hosting configuracion with ok', async () => {
        const m = {
            body: {
                apartamentoIDV
            },
            session: fakeAdminSession
        }
        const response = await detallePrecioBaseApartamento(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('list all prices of hosting configurations with ok', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await listaPreciosApartamentos(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('preview of price of hosting configurations with ok', async () => {
        const m = {
            body: {
                apartamentoIDV,
                propuestaPrecio: "87.00"
            },
            session: fakeAdminSession
        }
        const response = await previsualizarPrecioApartamento(m)
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
