
import { describe, expect, test } from '@jest/globals';
import { apartamentosDisponiblesAdministracion } from '../../../../logica/zonas/administracion/reservas/nuevaReserva/apartamentosDisponiblesAdministracion.mjs';

describe('apartments avaibles for bookins in bookin', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }

    test('search apartment avaibles for bookins with ok', async () => {
        const m = {
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
            },
            session: fakeAdminSession
        }
        const response = await apartamentosDisponiblesAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
})
