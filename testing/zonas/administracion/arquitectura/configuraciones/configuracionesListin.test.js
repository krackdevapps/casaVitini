
import { describe, expect, test } from '@jest/globals';
import { campoDeTransaccion } from '../../../../../src/infraestructure/repository/globales/campoDeTransaccion.mjs';
import { crearConfiguracionAlojamiento } from '../../../../../src/application/administracion/arquitectura/configuraciones/crearConfiguracionAlojamiento.mjs';
import { crearEntidadAlojamiento } from '../../../../../src/application/administracion/arquitectura/entidades/crearEntidadAlojamiento.mjs';
import { eliminarConfiguracionDeAlojamiento } from '../../../../../src/application/administracion/arquitectura/configuraciones/eliminarConfiguracionDeAlojamiento.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { actualizarZonaDeLaConfiguracionApartamento } from '../../../../../src/application/administracion/arquitectura/configuraciones/actualizarZonaDeLaConfiguracionApartamento.mjs';
import { addCamaToConfiguracionApartamentoHabitacion } from '../../../../../src/application/administracion/arquitectura/configuraciones/addCamaToConfiguracionApartamentoHabitacion.mjs';
import { eliminarCamaComoEntidad } from '../../../../../src/infraestructure/repository/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs';
import { eliminarHabitacionComoEntidad } from '../../../../../src/infraestructure/repository/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs';
import { addHabitacionToConfiguracionApartamento } from '../../../../../src/application/administracion/arquitectura/configuraciones/addHabitacionToConfiguracionApartamento.mjs';

describe('configuration of hosting', () => {
    const apartamentoIDV = "testingapartmentforconfigurationshostings"
    const apartamentoUI = "Apartamento para testing de configuraciones de alojamiento"
    const habitacionIDV = "habitacionparatestingdeconfiguraciones"
    const camaIDV = "camatestingdeconfiguraciones"
    let habitacionUID
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    beforeAll(async () => {
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarCamaComoEntidad(camaIDV)
        await eliminarHabitacionComoEntidad(habitacionIDV)
        await campoDeTransaccion("iniciar")
    })

    test('createEntity ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                apartamentoUI: apartamentoUI,
                apartamentoIDV: apartamentoIDV
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('create configuration base of hosting with ok', async () => {
        const makeEntity = {
            body: {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            },
            session: fakeAdminSession
        }
        const response = await crearConfiguracionAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create configuration base of hosting with ok', async () => {
        try {
            const makeEntity = {
                body: {
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI
                },
                session: fakeAdminSession
            }
            const response = await crearEntidadAlojamiento(makeEntity)
            expect(response).not.toBeUndefined();
        } catch (error) {
            // Verificamos que el error sea una instancia de Error
            expect(error).toBeInstanceOf(Error);
            // Verificamos que el mensaje del error sea el esperado
        }
    })
    test('update zone of configuration hosting with ok', async () => {

        const makeEntity = {
            body: {
                apartamentoIDV: apartamentoIDV,
                nuevaZona: "global"
            },
            session: fakeAdminSession
        }
        const response = await actualizarZonaDeLaConfiguracionApartamento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    // Crear habitacion
    test('create room as entity for configuracion hosting base with ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                habitacionUI: "Habitacion para testing",
                habitacionIDV: habitacionIDV
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    // Crear cama
    test('create bed as entity for configuracion hosting base with ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "cama",
                camaUI: "Nueva cama para testing",
                camaIDV: camaIDV,
                capacidad: "3",
                tipoCama: "compartida"
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    // Insertar habitacion en configuracion de alojamiento base
    test('add room in configuracion hosting base with ok', async () => {
        const makeEntity = {
            body: {
                habitacionIDV: habitacionIDV,
                apartamentoIDV: apartamentoIDV,
            },
            session: fakeAdminSession
        }
        const response = await addHabitacionToConfiguracionApartamento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        habitacionUID = response.habitacionUID

    })


    //Insertar cama en la habitacion
    test('add bed in room in configuracion hosting with ok', async () => {
        const makeEntity = {
            body: {
                camaIDV: camaIDV,
                habitacionUID: habitacionUID
            },
            session: fakeAdminSession
        }
        const response = await addCamaToConfiguracionApartamentoHabitacion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    //delete host configuration
    test('add bed in room in configuracion hosting with ok', async () => {
        const makeEntity = {
            body: {
                apartamentoIDV
            },
            session: fakeAdminSession
        }
        const response = await eliminarConfiguracionDeAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    afterAll(async () => {
        await campoDeTransaccion("cancelar")
        await eliminarCamaComoEntidad(camaIDV)
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarHabitacionComoEntidad(habitacionIDV)
    })
})
