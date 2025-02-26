
import { describe, expect, test } from '@jest/globals';
import { eliminarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { insertarCaracteristicaDelApartamento } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/insertarCaracteristicaDelApartamento.mjs';
import { eliminarCaracteristicasDelApartamentoPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarCaracteristicasDelApartamentoPorApartamentoIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoUI } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoUI.mjs';
import { obtenerTodasLasCaracteristicasDelApartamento } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/obtenerTodasLasCaracteristicasDelApartamento.mjs';
import { obtenerTodasLosApartamentos } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/obtenerTodasLosApartamentos.mjs';
import { actualizarApartamentoComoEntidadPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/actualizarApartamentoComoEntidadPorApartamentoIDV.mjs';

describe('crud apartament as entity', () => {
    const IDVStart = "apartamentoTestInicial"
    const IDVFinal = "apartamentoTestFinal"
    const UIStart = "nombreApartaamentoTest"
    beforeAll(async () => {
        await eliminarApartamentoComoEntidad(IDVStart)
        await eliminarApartamentoComoEntidad(IDVFinal)
    })
    test('insert apartament', async () => {
        const makeEntity = {
            apartamentoIDV: IDVStart,
            apartamentoUI: UIStart
        }
        const respons = await insertarApartamentoComoEntidad(makeEntity)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('insert feature in apartament', async () => {
        const makeEntity = {
            apartamentoIDV: IDVStart,
            caracteristica: "caracteristicaTestInicial"
        }
        const respons = await insertarCaracteristicaDelApartamento(makeEntity)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select features of apartment by IDV', async () => {
        const respons = await obtenerTodasLasCaracteristicasDelApartamento(IDVStart)
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
    })
    test('select apartament by IDV', async () => {
        const respons = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: IDVStart,
            errorSi: "noExiste"
        })
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select apartament by UI', async () => {
        const respons = await obtenerApartamentoComoEntidadPorApartamentoUI({
            apartamentoUI: UIStart,
            errorSi: "noExiste"
        })
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })

    test('select all featuress of apartment', async () => {
        const respons = await obtenerTodasLasCaracteristicasDelApartamento(IDVStart)
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
    })
    test('select all apartments', async () => {
        const respons = await obtenerTodasLosApartamentos()
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
    })
    test('update apartament', async () => {
        const updateEntity = {
            apartamentoIDVNuevo: IDVFinal,
            apartamentoUI: UIStart,
            apartamentoIDVSelector: IDVStart,
        }
        const respons = await actualizarApartamentoComoEntidadPorApartamentoIDV(updateEntity);
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');


    })
    test('delete all features of apartament', async () => {
        const respons = await eliminarCaracteristicasDelApartamentoPorApartamentoIDV(IDVStart)
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
    })
    afterAll(async () => {
        await eliminarApartamentoComoEntidad(IDVStart)
        await eliminarApartamentoComoEntidad(IDVFinal)
    });
})
