
import { describe, expect, test } from '@jest/globals';
import { eliminarEnlaceDePagoPorTestingVI } from '../../../../logica/repositorio/enlacesDePago/eliminarEnlaceDePagoPorTestingVI.mjs';
import { crearNuevoImpuesto } from '../../../../logica/zonas/administracion/impuestos/crearNuevoImpuesto.mjs';
import { eliminarImpuestoPorTestingVI } from '../../../../logica/repositorio/impuestos/eliminarImpuestoPorTestingVI.mjs';
import { detalleImpuesto } from '../../../../logica/zonas/administracion/impuestos/detalleImpuesto.mjs';
import { listarTodosLosImpuestos } from '../../../../logica/zonas/administracion/impuestos/listarTodosLosImpuestos.mjs';
import { listaImpuestosPaginados } from '../../../../logica/zonas/administracion/impuestos/listaImpuestosPaginados.mjs';
import { eliminarPerfilImpuesto } from '../../../../logica/zonas/administracion/impuestos/eliminarPerfilImpuesto.mjs';
import { guardarModificacionImpuesto } from '../../../../logica/zonas/administracion/impuestos/guardarModificacionImpuesto.mjs';

describe('crudTaxes system', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "taxfortesting"
    let impuestoUID
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        // Añadir el eliminar impuesto por testingVI
        await eliminarImpuestoPorTestingVI(testingVI)
        await eliminarEnlaceDePagoPorTestingVI(testingVI)
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

    test('update tax with ok', async () => {
        const m = {
            body: {
                impuestoUID: String(impuestoUID),
                nombre: "tax for testing updated",
                tipoImpositivo: "100.00",
                tipoValorIDV: "porcentaje",
                entidadIDV: "reserva",
            },
            session: fakeAdminSession
        }
        const response = await guardarModificacionImpuesto(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get details of tax with ok', async () => {
        const m = {
            body: {
                impuestoUID
            },
            session: fakeAdminSession
        }
        const response = await detalleImpuesto(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all taxes  with ok', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await listarTodosLosImpuestos(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get all taxes with pagination with ok', async () => {
        const m = {
            body: {
                pagina: 1
            },
            session: fakeAdminSession
        }
        const response = await listaImpuestosPaginados(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete tax with ok', async () => {
        const m = {
            body: {
                impuestoUID
            },
            session: fakeAdminSession
        }
        const response = await eliminarPerfilImpuesto(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarImpuestoPorTestingVI(testingVI)
    });

})
