
import { describe, expect, test } from '@jest/globals';
import { listarReservas } from '../../../../src/application/administracion/reservas/buscador/listarReservas.mjs';

describe('search of reserves', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    test('search of reserves for today with ok', async () => {
        const m = {
            body: {
                tipoConsulta: "hoy",
            },
            session: fakeAdminSession
        }
        const response = await listarReservas(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('search of reserves by range with ok', async () => {
        const m = {
            body: {
                tipoConsulta: "rango",
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                tipoCoincidencia: "cualquieraQueCoincida",
                pagina: 1
            },
            session: fakeAdminSession
        }
        const response = await listarReservas(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('search of reserves by word with ok', async () => {
        const m = {
            body: {
                tipoConsulta: "porTerminos",
                termino: "test",
                pagina: 1
            },
            session: fakeAdminSession
        }
        const response = await listarReservas(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

})
