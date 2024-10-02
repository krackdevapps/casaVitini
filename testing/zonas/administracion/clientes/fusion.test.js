
import { describe, expect, test } from '@jest/globals';
import { crearCliente } from '../../../../src/application/administracion/clientes/crearCliente.mjs';
import { eliminarClientePorTestingVI } from '../../../../src/infraestructure/repository/clientes/eliminarClientePorTestingVI.mjs';
import { fusion } from '../../../../src/application/administracion/clientes/fusion.mjs';

describe('fusion clients', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "testing"
    const fakeClient_origen = {
        nombre: "fakeName_origen",
        primerApellido: "fakeLastName",
        segundoApellido: "fakeLastSeconName",
        pasaporte: "passportFake_origen",
        telefono: "122333411",
        correoElectronico: "fakeorigen@mail.com",
        notas: "fakeNoteText",
    }
    const fakeClient_destino = {
        nombre: "fakeName_destino",
        primerApellido: "fakeLastName",
        segundoApellido: "fakeLastSeconName",
        pasaporte: "passportFake",
        telefono: "122333411",
        correoElectronico: "fakedestino@mail.com",
        notas: "fakeNoteText",
    }
    let clienteUID_origen
    let clienteUID_destino

    beforeAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
        process.env.TESTINGVI = testingVI;
    })

    test('create new client origin with ok', async () => {
        const newClient = {
            body: {
                ...fakeClient_origen
            },
            session: fakeAdminSession
        }
        const response = await crearCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID_origen = response.nuevoUIDCliente
    })

    test('create new client destiny with ok', async () => {
        const newClient = {
            body: {
                ...fakeClient_destino
            },
            session: fakeAdminSession
        }
        const response = await crearCliente(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        clienteUID_destino = response.nuevoUIDCliente
    })

    test('fusion clients with ok', async () => {
        const newClient = {
            body: {
                clienteUID_origen: clienteUID_origen,
                clienteUID_destino: clienteUID_destino
            },
            session: fakeAdminSession
        }
        const response = await fusion(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
    });
})
