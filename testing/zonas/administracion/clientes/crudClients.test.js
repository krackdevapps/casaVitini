
import { describe, expect, test } from '@jest/globals';
import { crearCliente } from '../../../../logica/zonas/administracion/clientes/crearCliente.mjs';
import { eliminarClientePorTestingVI } from '../../../../logica/repositorio/clientes/eliminarClientePorTestingVI.mjs';
import { modificarCliente } from '../../../../logica/zonas/administracion/clientes/modificarCliente.mjs';
import { reservasDelCliente } from '../../../../logica/zonas/administracion/clientes/reservasDelCliente.mjs';
import { detallesCliente } from '../../../../logica/zonas/administracion/clientes/detallesCliente.mjs';
import { buscar } from '../../../../logica/zonas/administracion/clientes/buscar.mjs';
import { eliminar } from '../../../../logica/zonas/administracion/clientes/eliminar.mjs';

describe('crud clients', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "testing"
    let clienteUID
    const fakeClient = {
        nombre: "fakeName",
        primerApellido: "fakeLastName",
        segundoApellido: "fakeLastSeconName",
        pasaporte: "passportFake",
        telefono: "122333411",
        correoElectronico: "fake@mail.com",
        notas: "fakeNoteText",
        testing: testingVI
    }
    const apartamentoIDV = "apartamentotestingcalendars"

    let calendarioUID
    beforeAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
    })


    test('create new client with ok', async () => {
        const newClient = {
            body: {
                ...fakeClient
            },
            session: fakeAdminSession
        }
        const response = await crearCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID = response.nuevoUIDCliente
    })

    test('update client with ok', async () => {
        const newClient = {
            body: {
                clienteUID,
                ...fakeClient
            },
            session: fakeAdminSession
        }
        const response = await modificarCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('bookins of client with ok', async () => {
        const newClient = {
            body: {
                clienteUID,
                pagina: 1
            },
            session: fakeAdminSession
        }
        const response = await reservasDelCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get client with ok', async () => {
        const newClient = {
            body: {
                clienteUID
            },
            session: fakeAdminSession
        }
        const response = await detallesCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('search client with ok', async () => {
        const newClient = {
            body: {
                buscar: "test",

            },
            session: fakeAdminSession
        }
        const response = await buscar(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete client with ok', async () => {
        const newClient = {
            body: {
                clienteUID
            },
            session: fakeAdminSession
        }
        const response = await eliminar(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
    });
})