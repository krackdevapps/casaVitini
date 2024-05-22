
import { describe, expect, test } from '@jest/globals';
import { eliminarApartamentoComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoUI } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoUI.mjs';
import { obtenerTodasLasCaracteristicasDelApartamento } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/obtenerTodasLasCaracteristicasDelApartamento.mjs';
import { actualizarApartamentoComoEntidadPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/actualizarApartamentoComoEntidadPorApartamentoIDV.mjs';
import { insertarCaracteristicaDelApartamento } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/insertarCaracteristicaDelApartamento.mjs';
import { eliminarCaracteristicasDelApartamentoPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/eliminarCaracteristicasDelApartamentoPorApartamentoIDV.mjs';
import { obtenerTodasLosApartamentos } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/obtenerTodasLosApartamentos.mjs';
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
    test('delete all features of apartament', async () => {
        const respons = await eliminarCaracteristicasDelApartamentoPorApartamentoIDV(IDVStart)
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
    })
    test('select apartament by IDV', async () => {
        const respons = await obtenerApartamentoComoEntidadPorApartamentoIDV(IDVStart)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select apartament by UI', async () => {
        const respons = await obtenerApartamentoComoEntidadPorApartamentoUI(UIStart)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select features of apartment by IDV', async () => {
        const respons = await obtenerTodasLasCaracteristicasDelApartamento(IDVStart)
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
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
            apartamentoIDVNuevo:IDVFinal,
            apartamentoUI:UIStart,
            apartamentoIDVSelector:IDVStart,
        }
        const respons = await actualizarApartamentoComoEntidadPorApartamentoIDV(updateEntity);
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    afterAll(async () => {
        await eliminarApartamentoComoEntidad(IDVStart)
        await eliminarApartamentoComoEntidad(IDVFinal)
    });
})
