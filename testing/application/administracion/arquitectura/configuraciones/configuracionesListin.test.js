
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
import { eliminarUsuarioPorTestingVI } from '../../../../../src/infraestructure/repository/usuarios/eliminarUsuarioPorTestingVI.mjs';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';

describe('configuration of hosting', () => {
    const apartamentoIDV = "testingapartmentforconfigurationshostings"
    const apartamentoUI = "Apartamento para testing de configuraciones de alojamiento"
    const apartamentoUI_2 = "Apartamento dos"
    const apartamentoIDV_2 = "testingapartmentforconfiguratidos"

    const habitacionIDV = "habitacionparatestingdeconfiguraciones"
    const habitacionUI = "Habitacion temporal para testing holder"

    const habitacionIDV_2 = "habitacionparatestingdeconfiguracionesdos"
    const habitacionUI_2 = "Habitacion temporal para testing holder dos"

    const camaUI = "camaTemporalParaTesting"
    const camaIDV = "camatestingdeconfiguraciones"

    const camaUI_2 = "camaTemporalParaTestingdos"
    const camaIDV_2 = "camatestingdeconfiguracionesdos"

    const testingVI = "hostingTemporalForTesting"
    let habitacionUID
    let reservaUID
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarUsuarioPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarCamaComoEntidad(camaIDV_2)
        await eliminarApartamentoComoEntidad(apartamentoIDV_2)
        await eliminarHabitacionComoEntidad(habitacionIDV_2)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: apartamentoUI,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI,
            camaIDV: camaIDV,
            camaUI: camaUI,
        })

        const reserva = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"

            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID
    })
    test('createEntity ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                apartamentoUI: apartamentoUI_2,
                apartamentoIDV: apartamentoIDV_2,
                apartamentoUIPublico: "apartamento para testing",
                definicionPublica: "Defininicion para testin"
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
                apartamentoIDV: apartamentoIDV_2,
                apartamentoUI: apartamentoUI_2
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

            expect(error).toBeInstanceOf(Error);

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


    test('create room as entity for configuracion hosting base with ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "habitacion",
                habitacionUI: habitacionUI_2,
                habitacionIDV: habitacionIDV_2
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('create bed as entity for configuracion hosting base with ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "cama",
                camaUI: "Nueva cama para testing",
                camaIDV: camaIDV_2,
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

    test('add room in configuracion hosting base with ok', async () => {
        const makeEntity = {
            body: {
                habitacionIDV: habitacionIDV_2,
                apartamentoIDV: apartamentoIDV_2,
            },
            session: fakeAdminSession
        }
        const response = await addHabitacionToConfiguracionApartamento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        habitacionUID = response.habitacionUID

    })



    test('add bed in room in configuracion hosting with ok', async () => {
        const makeEntity = {
            body: {
                camaIDV: camaIDV_2,
                habitacionUID: String(habitacionUID)
            },
            session: fakeAdminSession
        }
        const response = await addCamaToConfiguracionApartamentoHabitacion(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('delete configuracion hosting with ok', async () => {
        const makeEntity = {
            body: {
                apartamentoIDV: apartamentoIDV_2
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
        await eliminarCamaComoEntidad(camaIDV_2)
        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarApartamentoComoEntidad(apartamentoIDV_2)
        await eliminarHabitacionComoEntidad(habitacionIDV)
        await eliminarHabitacionComoEntidad(habitacionIDV_2)
        await eliminarReservaPorTestingVI(testingVI)

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2
        })


    })
})
