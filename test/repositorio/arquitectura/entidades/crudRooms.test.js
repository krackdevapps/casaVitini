
import { describe, expect, test } from '@jest/globals';
import { eliminarHabitacionComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs';
import { actualizarHabitacionComoEntidadPorHabitacionIDV } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/actualizarHabitacionComoEntidadPorHabitacionIDV.mjs';
import { insertarHabitacionComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/insertarHabitacionComoEntidad.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionUI } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionUI.mjs';
import { obtenerTodasLasHabitaciones } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/obtenerTodasLasHabitaciones.mjs';
describe('crud room as entity', () => {
    const IDVStart = "habitacionTestInicial"
    const IDVEnd = "habitacionTestFinal"
    const UIStart = "nombreTestHabitacionUID"
    const UISEnd = "nombreTestHabitacionUID"

    beforeAll(async () => {
        await eliminarHabitacionComoEntidad(IDVStart)
        await eliminarHabitacionComoEntidad(IDVEnd)

    })
    test('insert room', async () => {
        const createApartamento = {
            habitacionIDV: IDVStart,
            habitacionUI: UIStart,
        }
        const respuesta = await insertarHabitacionComoEntidad(createApartamento)
        expect(respuesta).not.toBeUndefined();
        expect(typeof respuesta).toBe('object');
    })
    test('select room by habitacionIDV', async () => {
        const respuesta = await obtenerHabitacionComoEntidadPorHabitacionIDV(IDVStart)
        expect(respuesta).not.toBeUndefined();
        expect(typeof respuesta).toBe('object');
    })
    test('select room by habitacionUI', async () => {
        const respuesta = await obtenerHabitacionComoEntidadPorHabitacionUI(UIStart)
        expect(respuesta).not.toBeUndefined();
        expect(typeof respuesta).toBe('object');
    })
    test('select all rooms', async () => {
        const respuesta = await obtenerTodasLasHabitaciones()
        expect(respuesta).not.toBeUndefined();
        expect(Array.isArray(respuesta)).toBe(true);
    })
    test('update room', async () => {
        const updateApartament = {
            habitacionIDVNuevo: IDVEnd,
            habitacionUI: UISEnd,
            habitacionIDVSelector: IDVStart
        }
        const respuesta = await actualizarHabitacionComoEntidadPorHabitacionIDV(updateApartament);
        expect(respuesta).not.toBeUndefined();
        expect(typeof respuesta).toBe('object');
    })
    afterAll(async () => {
        await eliminarHabitacionComoEntidad(IDVStart)
        await eliminarHabitacionComoEntidad(IDVEnd)
    });
})
