
import { describe, expect, test } from '@jest/globals';
import { campoDeTransaccion } from '../../../../../src/infraestructure/repository/globales/campoDeTransaccion.mjs';
import { listarApartamentosComoEntidades } from '../../../../../src/application/administracion/arquitectura/entidades/listarApartamentosComoEntidades.mjs';
import { listarEntidadesAlojamiento } from '../../../../../src/application/administracion/arquitectura/entidades/listarEntidadesAlojamiento.mjs';

describe('entitysListin', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    beforeAll(async () => {
        await campoDeTransaccion("iniciar")
    })
    test('list all apartamento as entitys with okk', async () => {
        const makeEntity = {
            session: fakeAdminSession
        }
        const response = await listarApartamentosComoEntidades(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('list all entitis of hosting with okk', async () => {
        const makeEntity = {
            session: fakeAdminSession
        }
        const response = await listarEntidadesAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await campoDeTransaccion("cancelar")
    })
})
