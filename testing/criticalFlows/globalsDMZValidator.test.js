
import { describe, expect, test } from '@jest/globals';
import { crearNuevoBloqueo } from '../../logica/zonas/administracion/bloqueos/crearNuevoBloqueo.mjs';

describe('critical: globalsDMZValidator', () => {

    beforeAll(async () => {
      })

    test('insert new apartmen lock by temporal range with ok', async () => {
        const newLock = {
            body: {
                zonaIDV: "global",
                apartamentoIDV: apartamentoIDV,
                fechaInicio: "2026-10-10",
                fechaFin: "2026-10-20",
                tipoBloqueoIDV: "rangoTemporal",
                motivo: "Bloqueo creado para testing"
            },
            session: fakeAdminSession
        }
        const response = await crearNuevoBloqueo(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })


    afterAll(async () => {


    });
})
