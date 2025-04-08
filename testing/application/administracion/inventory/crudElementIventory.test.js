
import { afterAll, describe, expect, test } from '@jest/globals';
import { crearNuevoElemento } from '../../../../src/application/administracion/inventario/crearNuevoElemento.mjs';
import { eliminarElementoPorTestingVI } from '../../../../src/infraestructure/repository/inventario/eliminarElementoPorTestingVI.mjs';
import { actualizarCantidadDelElemento } from '../../../../src/application/administracion/inventario/actualizarCantidadDelElemento.mjs';
import { actualizarElemento } from '../../../../src/application/administracion/inventario/actualizarElemento.mjs';
import { buscador } from '../../../../src/application/administracion/inventario/buscador.mjs';
import { buscadorRegistroDelElemento } from '../../../../src/application/administracion/inventario/buscadorRegistroDelElemento.mjs';
import { buscadorRegistroInventario } from '../../../../src/application/administracion/inventario/buscadorRegistroInventario.mjs';
import { detallesDelRegistroDelInventario } from '../../../../src/application/administracion/inventario/detallesDelRegistroDelInventario.mjs';
import { obtenerDetallesElemento } from '../../../../src/application/administracion/inventario/obtenerDetallesElemento.mjs';
import { situacionInventario } from '../../../../src/application/administracion/inventario/situacionInventario.mjs';
import { eliminarFilaRegistroDelElemento } from '../../../../src/application/administracion/inventario/eliminarFilaRegistroDelElemento.mjs';
import { eliminarElemento } from '../../../../src/application/administracion/inventario/eliminarElemento.mjs';

describe('crud inventory', () => {
    const testingVI = "testingInventory"
    let elementoUID
    let registroUID
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarElementoPorTestingVI(testingVI)
    })

    test('Create new elemento in inventory', async () => {

        const response = await crearNuevoElemento({
            body: {
                nombre: "Elemento para testing",
                cantidad: "10",
                tipoLimite: "sinLimite",
                cantidadMinima: "0",
                descripcion: "testing",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        elementoUID = response.elementoUID

    })


    test('update item quantity', async () => {

        const response = await actualizarCantidadDelElemento({
            body: {
                elementoUID,
                cantidad: "20",
                operacionIDV: "insertarEnInventario",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');


    })


    test('update item data', async () => {

        const response = await actualizarElemento({
            body: {
                elementoUID,
                nombre: "nombre actualizaad",
                tipoLimite: "sinLimite",
                cantidadMinima: "0",
                descripcion: "test"
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('search global inventory', async () => {

        const response = await buscador({
            body: {
                buscar: "test",

            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('search in item inventory', async () => {

        const response = await buscadorRegistroDelElemento({
            body: {
                buscar: "",
                elementoUID

            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        const primerRegistro = response.elementos[0].uid

        registroUID = primerRegistro
    })


    test('search in item log history inventory', async () => {

        const response = await buscadorRegistroInventario({
            body: {
                buscar: "",
            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get details of log item in inventory', async () => {

        const response = await detallesDelRegistroDelInventario({
            body: {
                registroUID

            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get details of item in inventory', async () => {

        const response = await obtenerDetallesElemento({
            body: {
                elementoUID
            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get sitution of inventory', async () => {

        const response = await situacionInventario({
            body: {},
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('delete row of log item in inventory', async () => {

        const response = await eliminarFilaRegistroDelElemento({
            body: {
                uid: registroUID

            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('delete item of inventory', async () => {

        const response = await eliminarElemento({
            body: {
                elementoUID
            },
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    afterAll(async () => {
        await eliminarElementoPorTestingVI(testingVI)
    })


})
