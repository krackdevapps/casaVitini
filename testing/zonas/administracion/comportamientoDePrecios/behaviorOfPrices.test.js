
import { describe, expect, test } from '@jest/globals';
import { crearComportamiento } from '../../../../src/application/administracion/comportamientoDePrecios/crearComportamiento.mjs';
import { eliminarComportamientoPorTestingVI } from '../../../../src/infraestructure/repository/comportamientoDePrecios/eliminarComportamientoPorTestingVI.mjs';
import { actualizarEstadoComportamiento } from '../../../../src/application/administracion/comportamientoDePrecios/actualizarEstadoComportamiento.mjs';
import { detallesComportamiento } from '../../../../src/application/administracion/comportamientoDePrecios/detallesComportamiento.mjs';
import { listaComportamientosPrecios } from '../../../../src/application/administracion/comportamientoDePrecios/listaComportamientosPrecios.mjs';
import { eliminarComportamiento } from '../../../../src/application/administracion/comportamientoDePrecios/eliminarComportamiento.mjs';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';

describe('behavior of prices clients', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "testing"
    let comportamientoUID
    const apartamentoIDV = "apartamentfortestingadddiscountstoreserve"
    const apartamentoUI = "Apartamento temporal creado para discounts"
    const habitacionIDV = "temporalroomfortestingadddiscountstoreserve"
    const habitacionUI = "Habitacion temporal para testing discounts"
    const camaIDV = "temporalbedfortestingaddapartamentotoreserve"
    const camaUI = "Cama temporal para testing de discounts"
    beforeAll(async () => {
        await eliminarComportamientoPorTestingVI(testingVI)
        process.env.TESTINGVI = testingVI


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

    })

    test('make behavior type by range of price with ok', async () => {
        const newBehavior = {
            body: {
                nombreComportamiento: "Comportameinto para testin",
                testing: "testing",
                estadoInicalDesactivado: "desactivado",
                contenedor: {
                    tipo: "porRango",
                    fechaInicio: "2024-08-14",
                    fechaFinal: "2024-08-16",
                    apartamentos: [
                        {
                            apartamentoIDV: apartamentoIDV,
                            cantidad: "10.00",
                            simboloIDV: "aumentoCantidad"
                        }
                    ]
                },
                transaccion: "crear"
            },
            session: fakeAdminSession
        }
        const response = await crearComportamiento(newBehavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        comportamientoUID = response.comportamientoUID
    })

    test('update status of behavior with ok', async () => {
        const behavior = {
            body: {
                comportamientoUID: comportamientoUID,
                estadoPropuesto: "testing",
                estadoInicalDesactivado: "desactivado",
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoComportamiento(behavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update behavior with ok', async () => {
        const behavior = {
            body: {
                comportamientoUID: comportamientoUID,
                estadoPropuesto: "testing",
                estadoInicalDesactivado: "desactivado",
                transaccion: "actualizar",
                contenedor: {
                    tipo: "porRango",
                    fechaInicio: "2024-08-14",
                    fechaFinal: "2024-08-16",
                    apartamentos: [
                        {
                            apartamentoIDV: apartamentoIDV,
                            cantidad: "10.00",
                            simboloIDV: "aumentoCantidad"
                        }
                    ]
                },
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoComportamiento(behavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get behavior with ok', async () => {
        const behavior = {
            body: {
                comportamientoUID: comportamientoUID,
            },
            session: fakeAdminSession
        }
        const response = await detallesComportamiento(behavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('get list of all behavior with ok', async () => {
        const behavior = {
            body: {},
            session: fakeAdminSession
        }
        const response = await listaComportamientosPrecios(behavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get price of apartaments by date range with ok', async () => {
        const behavior = {
            body: {
                fechaEntada: "20-02-2061",
                fechaEntada: "20-02-2061",
                apartamentosIDVArreglo: [
                    "apartamento4"
                ]
            },
            session: fakeAdminSession
        }
        const response = await listaComportamientosPrecios(behavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('delete behavior of apartament by use case with ok', async () => {
        const behavior = {
            body: {
                comportamientoUID
            },
            session: fakeAdminSession
        }
        const response = await eliminarComportamiento(behavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarComportamientoPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    });
})
