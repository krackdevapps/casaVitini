
import { describe, expect, test } from '@jest/globals';
import { obtener_reservas } from '../../../../logica/zonas/administracion/reservas/pendientes_de_revision/obtener_reservas.mjs';

describe('bookingPendingOfRevision in administrative zone', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    test('get booking pending of revision with ok', async () => {
        const m = {
            body: {           },
            session: fakeAdminSession
        }
        const response = await obtener_reservas(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


})
