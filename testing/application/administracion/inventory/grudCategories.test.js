
import { afterAll, describe, expect, test } from '@jest/globals';
import { crearNuevoElemento } from '../../../../src/application/administracion/inventario/crearNuevoElemento.mjs';
import { eliminarElementoPorTestingVI } from '../../../../src/infraestructure/repository/inventario/eliminarElementoPorTestingVI.mjs';
import { eliminarCategoriaPorTestingVI } from '../../../../src/infraestructure/repository/inventario/categorias/eliminarCategoriaPorTestingVI.mjs';
import { crearCategoria } from '../../../../src/application/administracion/inventario/categorias/crearCategoria.mjs';
import { actualizarNombreCategoria } from '../../../../src/application/administracion/inventario/categorias/actualizarNombreCategoria.mjs';
import { buscadorCategorias } from '../../../../src/application/administracion/inventario/categorias/buscadorCategorias.mjs';
import { buscadorElementosEnCategoria } from '../../../../src/application/administracion/inventario/categorias/buscadorElementosEnCategoria.mjs';
import { detallesCategoria } from '../../../../src/application/administracion/inventario/categorias/detallesCategoria.mjs';
import { insertarInventarioEnCategoria } from '../../../../src/application/administracion/inventario/categorias/insertarInventarioEnCategoria.mjs';
import { eliminarInventarioEnCategoria } from '../../../../src/application/administracion/inventario/categorias/eliminarInventarioEnCategoria.mjs';
import { eliminarCategoria } from '../../../../src/application/administracion/inventario/categorias/eliminarCategoria.mjs';

describe('crud categories', () => {
    const testingVI = "testingInventoryCategories"
    let elementoUID
    let categoriaUID
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarElementoPorTestingVI(testingVI)
        await eliminarCategoriaPorTestingVI(testingVI)
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

    test('Create new category in inventory', async () => {
        const response = await crearCategoria({
            body: {
                categoriaUI: "Elemento para testing",
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        categoriaUID = response.categoriaUID
    })


    test('update name of category in inventory', async () => {
        const response = await actualizarNombreCategoria({
            body: {
                categoriaUI: "Elemento para testing",
                categoriaUID,
                descripcion: ""
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('search in categories', async () => {
        const response = await buscadorCategorias({
            body: {
                buscar: ""
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('search in elements in categories', async () => {
        const response = await buscadorElementosEnCategoria({
            body: {
                buscar: "",
                categoriaUID
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get details of category', async () => {
        const response = await detallesCategoria({
            body: {
                categoriaUID
            }
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert item inventory in category', async () => {
        const response = await insertarInventarioEnCategoria({
            body: {
                categoriaUID,
                elementoUID
            }
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete item inventory in category', async () => {
        const response = await eliminarInventarioEnCategoria({
            body: {
                categoriaUID,
                elementoUID
            }
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete category', async () => {
        const response = await eliminarCategoria({
            body: {
                categoriaUID
            }
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    afterAll(async () => {
        await eliminarElementoPorTestingVI(testingVI)
        await eliminarCategoriaPorTestingVI(testingVI)
    })


})
