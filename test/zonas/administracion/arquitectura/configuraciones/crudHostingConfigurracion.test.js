
import { describe, expect, test } from '@jest/globals';
import { eliminarCamaComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs';
import { insertarConfiguracionApartamento } from '../../../../../logica/repositorio/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { obtenerConfiguracionPorArrayDeApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerConfiguracionPorArrayDeApartamentoIDV.mjs';
import { obtenerConfiguracionPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { insertarHabitacionEnApartamento } from '../../../../../logica/repositorio/arquitectura/configuraciones/insertarHabitacionEnApartamento.mjs';
import { eliminarHabitacionComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs';
import { insertarHabitacionComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/habitacion/insertarHabitacionComoEntidad.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { insertarCamaComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/cama/insertarCamaComoEntidad.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamento } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles.mjs';
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerHabitacionDelApartamentoPorHabitacionIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionIDV.mjs';
import { actualizarImagenDelApartamentoPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/actualizarImagenDelApartamentoPorApartamentoIDV.mjs';
import { eliminarHabitacionDelApartamentoPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/eliminarHabitacionDelApartamentoPorApartamentoIDV.mjs';
import { insertarCamaEnHabitacion } from '../../../../../logica/repositorio/arquitectura/configuraciones/insertarCamasEnHabitacion.mjs';
import { eliminarCamaDeLaHabitacionPorCamaUID } from '../../../../../logica/repositorio/arquitectura/configuraciones/eliminarCamaDeLaHabitacionPorCamaUID.mjs';
import { insertarApartamentoComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../../logica/repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { obtenerImagenApartamentoPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/obtenerImagenApartamentoPorApartamentoIDV.mjs';
import { actualizarEstadoPorApartamentoIDV } from '../../../../../logica/repositorio/arquitectura/configuraciones/actualizarEstadoPorApartamentoIDV.mjs';
describe('crud hosting configuracion', () => {
    const IDVStart = "configuracionalojaminetotest"

    const habitacionIDV = "habitacionTestConfiguracion"
    const habitacionUI = "habitacion para probar test"

    const camaIDV = "camaTestConfiguracion"
    const camaUI = "cama para test de configuracion"

    let nuevaHabitacionUID = 0
    let nuevaCamaUID = 0

    beforeAll(async () => {
        await eliminarHabitacionComoEntidad(habitacionIDV)
        await eliminarCamaComoEntidad(camaIDV)
        await eliminarConfiguracionPorApartamentoIDV(IDVStart)
        await eliminarApartamentoComoEntidad(IDVStart)

        await insertarApartamentoComoEntidad({
            apartamentoIDV: IDVStart,
            apartamentoUI: "apartamento para test",
        })

        await insertarHabitacionComoEntidad({
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI,
        })
        await insertarCamaComoEntidad({
            camaIDV: camaIDV,
            camaUI: camaUI,
            capacidad: 3
        })
    })
    test('insert hosting void', async () => {
         const response = await insertarConfiguracionApartamento({
            apartamentoIDV: IDVStart,
            estadoInicial: "nodisponible",
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('insert room in hosting configuracion', async () => {
        const roomInHostingConfiguracion = {
            apartamentoIDV: IDVStart,
            habitacionIDV: habitacionIDV,
        }
        const response = await insertarHabitacionEnApartamento(roomInHostingConfiguracion)
        nuevaHabitacionUID = response.componenteUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('insert bed in room in hosting configuracion', async () => {
        const roomInHostingConfiguracion = {
            habitacionUID: nuevaHabitacionUID,
            camaIDV: camaIDV,
        }
        const response = await insertarCamaEnHabitacion(roomInHostingConfiguracion)
        nuevaCamaUID = response.componenteUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select hosting by apartamentoIDV', async () => {
        const response = await obtenerConfiguracionPorApartamentoIDV(IDVStart)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select hostin by apartamentoIDV Array', async () => {
        const arrayHosting = [
            IDVStart
        ]
        const response = await obtenerConfiguracionPorArrayDeApartamentoIDV(arrayHosting)
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })


    test('select images of hostin ', async () => {
        const response = await obtenerImagenApartamentoPorApartamentoIDV(IDVStart)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('select all hostins configurations', async () => {
        const response = await obtenerTodasLasConfiguracionDeLosApartamento()
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('select all hostins configurations with ORDER BY ASC', async () => {
        const response = await obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc()
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('select all hostins configurations NOT avaibles', async () => {
        const response = await obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles()
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('select room of apartament by habitacionIDV', async () => {
        const response = await obtenerHabitacionDelApartamentoPorHabitacionIDV({
            apartamentoIDV: IDVStart,
            habitacionIDV: habitacionIDV
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('select room of apartament by habitacionUID', async () => {
        const response = await obtenerHabitacionDelApartamentoPorHabitacionUID(nuevaHabitacionUID)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('select room of apartament by apartamentoIDV', async () => {
        const response = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(IDVStart)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update status of hosting configuracion by apartamentoIDV', async () => {
        const response = await actualizarEstadoPorApartamentoIDV({
            nuevoEstado: "disponible",
            apartamentoIDV: IDVStart
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update image of hosting configuracion', async () => {
        const response = await actualizarImagenDelApartamentoPorApartamentoIDV({
            imagen: "base64testImage",
            apartamentoIDV: IDVStart
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

 
    test('delete bed of room in hosting configuracion', async () => {
        const response = await eliminarCamaDeLaHabitacionPorCamaUID(nuevaCamaUID)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('delete room in hosting configuracion', async () => {
        const response = await eliminarHabitacionDelApartamentoPorApartamentoIDV(IDVStart)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('delete hosting configuracion', async () => {
        const response = await eliminarConfiguracionPorApartamentoIDV(IDVStart)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    afterAll(async () => {
        await eliminarHabitacionComoEntidad(habitacionIDV)
        await eliminarCamaComoEntidad(habitacionIDV)
        await eliminarConfiguracionPorApartamentoIDV(IDVStart)
        await eliminarApartamentoComoEntidad(IDVStart)
    });
})
