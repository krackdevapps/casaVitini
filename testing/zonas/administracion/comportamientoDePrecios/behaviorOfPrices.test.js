
import { describe, expect, test } from '@jest/globals';
import { crearComportamiento } from '../../../../logica/zonas/administracion/comportamientoDePrecios/crearComportamiento.mjs';
import { eliminarComportamientoPorTestinVI } from '../../../../logica/repositorio/comportamientoDePrecios/eliminarComportamientoPorTestinVI.mjs';
import { actualizarEstadoComportamiento } from '../../../../logica/zonas/administracion/comportamientoDePrecios/actualizarEstadoComportamiento.mjs';
import { detallesComportamiento } from '../../../../logica/zonas/administracion/comportamientoDePrecios/detallesComportamiento.mjs';
import { listaComportamientosPrecios } from '../../../../logica/zonas/administracion/comportamientoDePrecios/listaComportamientosPrecios.mjs';
import { eliminarComportamiento } from '../../../../logica/zonas/administracion/comportamientoDePrecios/eliminarComportamiento.mjs';

describe('behavior of prices clients', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "testing"
    let comportamientoUID

    beforeAll(async () => {
        await eliminarComportamientoPorTestinVI(testingVI)
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
                            apartamentoIDV: "apartamento7",
                            cantidad: "10.00",
                            simboloIDV: "aumentoCantidad"
                        },
                        {
                            apartamentoIDV: "apartamento5",
                            cantidad: "10.00",
                            simboloIDV: "reducirPorcentaje"
                        },
                        {
                            apartamentoIDV: "apartamento6",
                            cantidad: "10.00",
                            simboloIDV: "reducirCantidad"
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
                            apartamentoIDV: "apartamento7",
                            cantidad: "10.00",
                            simboloIDV: "aumentoCantidad"
                        },
                        {
                            apartamentoIDV: "apartamento5",
                            cantidad: "10.00",
                            simboloIDV: "reducirPorcentaje"
                        },
                        {
                            apartamentoIDV: "apartamento6",
                            cantidad: "10.00",
                            simboloIDV: "reducirCantidad"
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
        await eliminarComportamientoPorTestinVI(testingVI)
    });
})
