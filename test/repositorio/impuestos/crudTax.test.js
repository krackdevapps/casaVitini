
import { describe, expect, test } from '@jest/globals';
import { eliminarImpuestoPorImpuestoTVI } from '../../../logica/repositorio/impuestos/eliminarImpuestoPorImpuestoTVI.mjs';
import { insertarImpuesto } from '../../../logica/repositorio/impuestos/insertarImpuesto.mjs';
import { actualizarImpuesto } from '../../../logica/repositorio/impuestos/actualizarImpuesto.mjs';
import { obtenerImpuestosPorAplicacionIDVPorEstado } from '../../../logica/repositorio/impuestos/obtenerImpuestosPorAplicacionIDVPorEstado.mjs';
import { obtenerImpuestosPorAplicacionSobre } from '../../../logica/repositorio/impuestos/obtenerImpuestosPorAplicacionSobre.mjs';
import { obtenerImpuestosPorImppuestoUID } from '../../../logica/repositorio/impuestos/obtenerImpuestosPorImpuestoUID.mjs';
import { obtenerImpuestosPorNombreDelImpuesto } from '../../../logica/repositorio/impuestos/obtenerImpuestosPorNombreDelImpuesto.mjs';
import { obtenerTipoValorPorTipoValorIDV } from '../../../logica/repositorio/impuestos/obtenerTipoValorPorTipoValorIDV.mjs';
import { obtenerTodosImpuestosConOrdenamiento } from '../../../logica/repositorio/impuestos/obtenerTodosImpuestosConOrdenamiento.mjs';

describe('crud tax', () => {
    const impuestoTVI = "impuestoTest"
    const nombreImpuesto = "impuesto_for_testing"
    const tipoValor = "tasa"
    let nuevoImpuestoUID = 0
    beforeAll(async () => {
        await eliminarImpuestoPorImpuestoTVI(impuestoTVI)
    })

    test('insert new tax', async () => {
        const response = await insertarImpuesto({
            nombreImpuesto: nombreImpuesto,
            tipoImpositivo: "10.00",
            tipoValor: "tasa",
            aplicacionSobre: "totalNeto",
            estado: "desactivado",
            impuestoTVI: impuestoTVI,
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

    test('select tax by ApliocacionIDV', async () => {
        const response = await obtenerImpuestosPorAplicacionSobre(["totalNeto"]);
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
        await eliminarImpuestoPorImpuestoTVI(impuestoTVI)
    });
})
