
import { describe, expect, test } from '@jest/globals';
import { eliminarHabitacionComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs';
import { eliminarCamaComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { insertarHabitacionComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/habitacion/insertarHabitacionComoEntidad.mjs';
import { insertarCamaComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/cama/insertarCamaComoEntidad.mjs';
import { insertarConfiguracionApartamento } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { insertarHabitacionEnApartamento } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/insertarHabitacionEnApartamento.mjs';
import { insertarCamaEnHabitacion } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/insertarCamasEnHabitacion.mjs';
import { obtenerConfiguracionPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { obtenerConfiguracionPorArrayDeApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorArrayDeApartamentoIDV.mjs';
import { obtenerImagenApartamentoPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerImagenApartamentoPorApartamentoIDV.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamento } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles.mjs';
import { obtenerHabitacionDelApartamentoPorHabitacionIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionIDV.mjs';
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { actualizarEstadoPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/actualizarEstadoPorApartamentoIDV.mjs';
import { actualizarImagenDelApartamentoPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/actualizarImagenDelApartamentoPorApartamentoIDV.mjs';
import { eliminarCamaDeLaHabitacionPorCamaUID } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/eliminarCamaDeLaHabitacionPorCamaUID.mjs';
import { eliminarHabitacionDelApartamentoPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/eliminarHabitacionDelApartamentoPorApartamentoIDV.mjs';


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
        await eliminarApartamentoComoEntidad(IDVStart)
        await eliminarConfiguracionPorApartamentoIDV(IDVStart)


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
            capacidad: 3,
            tipoCama: "compartida"
        })
    })
    test('insert hosting void', async () => {
        const response = await insertarConfiguracionApartamento({
            apartamentoIDV: IDVStart,
            estadoInicial: "nodisponible",
            zonaIDV: "global"
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
        const response = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV: IDVStart,
            errorSi: "noExiste"
        })
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
        const response = await obtenerImagenApartamentoPorApartamentoIDV({
            apartamentoIDV: IDVStart,
            estadoConfiguracionIDV_array: ["nodisponible"]
        })

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
            habitacionIDV: habitacionIDV,
            errorSi: "noExiste"
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
        await eliminarApartamentoComoEntidad(IDVStart)
        await eliminarConfiguracionPorApartamentoIDV(IDVStart)
    });
})
