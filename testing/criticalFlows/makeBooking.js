
import { describe, expect, test } from '@jest/globals';
import { eliminarHabitacionComoEntidad } from '../../../../logica/repositorio/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs';
import { eliminarCamaComoEntidad } from '../../../../logica/repositorio/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../../logica/repositorio/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../logica/repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../../logica/repositorio/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { insertarHabitacionComoEntidad } from '../../../../logica/repositorio/arquitectura/entidades/habitacion/insertarHabitacionComoEntidad.mjs';
import { insertarCamaComoEntidad } from '../../../../logica/repositorio/arquitectura/entidades/cama/insertarCamaComoEntidad.mjs';
import { insertarConfiguracionApartamento } from '../../../../logica/repositorio/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { insertarHabitacionEnApartamento } from '../../../../logica/repositorio/arquitectura/configuraciones/insertarHabitacionEnApartamento.mjs';

describe('crud hosting configuracion', () => {
    const IDVStart = "configuracionalojaminetotest"

    const habitacionIDV = "habitacionTestConfiguracion"
    const habitacionUI = "habitacion para probar test"

    const camaIDV = "camaTestConfiguracion"
    const camaUI = "cama para test de configuracion"

    let nuevaHabitacionUID = 0
    let nuevaCamaUID = 0

    // beforeAll(async () => {
    //     await eliminarHabitacionComoEntidad(habitacionIDV)
    //     await eliminarCamaComoEntidad(camaIDV)
    //     await eliminarApartamentoComoEntidad(IDVStart)
    //     await eliminarConfiguracionPorApartamentoIDV(IDVStart)


    //     await insertarApartamentoComoEntidad({
    //         apartamentoIDV: IDVStart,
    //         apartamentoUI: "apartamento para test",
    //     })

    //     await insertarHabitacionComoEntidad({
    //         habitacionIDV: habitacionIDV,
    //         habitacionUI: habitacionUI,
    //     })
    //     await insertarCamaComoEntidad({
    //         camaIDV: camaIDV,
    //         camaUI: camaUI,
    //         capacidad: 3,
    //         tipoCama: "compartida"
    //     })
    // })

    // // crear reserva ok
    // // crear reserva con error por otra reserva
    // // crear reserva con error por bloqueo
    // // crear reserva con error por calendarioSincronizaco

    // test('insert hosting void', async () => {
    //     const response = await insertarConfiguracionApartamento({
    //         apartamentoIDV: IDVStart,
    //         estadoInicial: "nodisponible",
    //         zonaIDV: "global"
    //     })
    //     expect(response).not.toBeUndefined();
    //     expect(typeof response).toBe('object');
    // })
    
    // test('insert room in hosting configuracion', async () => {
    //     const roomInHostingConfiguracion = {
    //         apartamentoIDV: IDVStart,
    //         habitacionIDV: habitacionIDV,
    //     }
    //     const response = await insertarHabitacionEnApartamento(roomInHostingConfiguracion)
    //     nuevaHabitacionUID = response.componenteUID
    //     expect(response).not.toBeUndefined();
    //     expect(typeof response).toBe('object');
    // })


    // afterAll(async () => {
    //     await eliminarHabitacionComoEntidad(habitacionIDV)
    //     await eliminarCamaComoEntidad(habitacionIDV)
    //     await eliminarApartamentoComoEntidad(IDVStart)
    //     await eliminarConfiguracionPorApartamentoIDV(IDVStart)
    // });
})
