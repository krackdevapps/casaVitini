
import { describe, expect, test } from '@jest/globals';
import { eliminarCamaComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs';
import { insertarCamaComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/cama/insertarCamaComoEntidad.mjs';
import { obtenerCamaComoEntidadPorCamaUI } from '../../../../src/infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaUI.mjs';
import { obtenerTodasLasHabitaciones } from '../../../../src/infraestructure/repository/arquitectura/entidades/habitacion/obtenerTodasLasHabitaciones.mjs';
import { actualizarCamaComoEntidadPorCamaIDV } from '../../../../src/infraestructure/repository/arquitectura/entidades/cama/actualizarCamaComoEntidadPorCamaIDV.mjs';
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from '../../../../src/infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs';

describe('crud bed as entity', () => {
    const IDVStart = "camaTestInicial"
    const IDVFinal = "camaTestFinal"
    const UIStart = "nombreCamaTest"
    beforeAll(async () => {
        await eliminarCamaComoEntidad(IDVStart)
        await eliminarCamaComoEntidad(IDVFinal)
    })
    test('insert bed', async () => {
        const makeEntity = {
            camaIDV: IDVStart,
            camaUI: UIStart,
            capacidad: 2,
            tipoCama: "compartida"
        }
        const respons = await insertarCamaComoEntidad(makeEntity)
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select bed by camaIDV', async () => {
        const respons = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
            camaIDV: IDVStart,
            tipoIDVArray: ["compartida"],
            errorSi: "noExiste"
        })
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select bed by camaUI', async () => {
        const respons = await obtenerCamaComoEntidadPorCamaUI({
            camaUI: UIStart,
            errorSi: "noExiste"
        })
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    test('select all beds', async () => {
        const respons = await obtenerTodasLasHabitaciones()
        expect(respons).not.toBeUndefined();
        expect(Array.isArray(respons)).toBe(true);
    })
    test('update bed', async () => {
        const updateEntity = {
            camaIDVNuevo: IDVFinal,
            camaUI: UIStart,
            capacidad: 4,
            camaIDV: IDVStart,
        }
        const respons = await actualizarCamaComoEntidadPorCamaIDV(updateEntity);
        expect(respons).not.toBeUndefined();
        expect(typeof respons).toBe('object');
    })
    afterAll(async () => {
        await eliminarCamaComoEntidad(IDVStart)
        await eliminarCamaComoEntidad(IDVFinal)
    });
})
