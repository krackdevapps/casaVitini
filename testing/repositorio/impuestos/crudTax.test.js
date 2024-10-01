
import { describe, expect, test } from '@jest/globals';
import { insertarImpuesto } from '../../../src/infraestructure/repository/impuestos/insertarImpuesto.mjs';
import { actualizarImpuesto } from '../../../src/infraestructure/repository/impuestos/actualizarImpuesto.mjs';
import { obtenerImpuestosPorAplicacionIDVPorEstado } from '../../../src/infraestructure/repository/impuestos/obtenerImpuestosPorAplicacionIDVPorEstado.mjs';
import { obtenerImpuestosPorImppuestoUID } from '../../../src/infraestructure/repository/impuestos/obtenerImpuestosPorImpuestoUID.mjs';
import { obtenerImpuestosPorNombreDelImpuesto } from '../../../src/infraestructure/repository/impuestos/obtenerImpuestosPorNombreDelImpuesto.mjs';
import { obtenerTipoValorPorTipoValorIDV } from '../../../src/infraestructure/repository/impuestos/obtenerTipoValorPorTipoValorIDV.mjs';
import { obtenerTodosImpuestosConOrdenamiento } from '../../../src/infraestructure/repository/impuestos/obtenerTodosImpuestosConOrdenamiento.mjs';
import { eliminarImpuestoPorTestingVI } from '../../../src/infraestructure/repository/impuestos/eliminarImpuestoPorTestingVI.mjs';

describe('crud tax', () => {
    const testingVI = "impuestoTest"
    const nombreImpuesto = "impuesto_for_testing"
    const tipoValor = "tasa"
    let nuevoImpuestoUID = 0
    beforeAll(async () => {
        await eliminarImpuestoPorTestingVI(testingVI)
    })

    test('insert new tax', async () => {
        const response = await insertarImpuesto({
            nombreImpuesto: nombreImpuesto,
            tipoImpositivo: "10.00",
            tipoValor: "tasa",
            aplicacionSobre: "totalNeto",
            estado: "desactivado",
            testingVI: testingVI,
        })
        nuevoImpuestoUID = response.impuestoUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update tax', async () => {
        const response = await actualizarImpuesto({
            impuestoUID: nuevoImpuestoUID,
            nombreImpuesto: nombreImpuesto,
            tipoImpositivo: "10.00",
            tipoValor: "tasa",
            aplicacionSobre: "totalNeto",
            estado: "desactivado",
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select tax by ApliocacionIDV and estadoIDV', async () => {
        const response = await obtenerImpuestosPorAplicacionIDVPorEstado({
            aplicacionSobre_array: ["totalNeto"],
            estadoIDV: "desactivado"
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })



    test('select tax by impuestoUID', async () => {
        const response = await obtenerImpuestosPorImppuestoUID(nuevoImpuestoUID);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select tax by nameUI', async () => {
        const response = await obtenerImpuestosPorNombreDelImpuesto(nombreImpuesto);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('select tax by tipoValodIDV', async () => {
        const response = await obtenerTipoValorPorTipoValorIDV(tipoValor);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('select tax by tipoValodIDV', async () => {
        const response = await obtenerTipoValorPorTipoValorIDV(tipoValor);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('select taxes by seach parameters', async () => {
        const response = await obtenerTodosImpuestosConOrdenamiento({
            nombreColumna: "nombre",
            sentidoColumna: "ascendente",
            numeroPagina: "1",
            numeroPorPagina: "10"
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    afterAll(async () => {
        await eliminarImpuestoPorTestingVI(testingVI)
    });
})
