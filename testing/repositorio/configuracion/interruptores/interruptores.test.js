
import { describe, expect, test } from '@jest/globals';
import { obtenerInterruptorPorInterruptorIDV } from '../../../../logica/repositorio/configuracion/interruptores/obtenerInterruptorPorInterruptorIDV.mjs';
import { actualizarEstadoDelInterruptor } from '../../../../logica/repositorio/configuracion/interruptores/actualizarEstadoDelInterruptor.mjs';
import { obtenerTodosLosInterruptores } from '../../../../logica/repositorio/configuracion/interruptores/obtenerTodosLosInterruptores.mjs';

describe('handler configruacion', () => {

    const interruptorIDV = "aceptarReservasPublicas"
    let estadoInterruptor

    test('selec configuracion', async () => {
        const response = await obtenerInterruptorPorInterruptorIDV(interruptorIDV)
        estadoInterruptor = response.estadoIDV
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('update configuracion', async () => {
        const response = await obtenerTodosLosInterruptores()
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })
    test('update configuracion', async () => {
        const response = await actualizarEstadoDelInterruptor({
            interruptorIDV: interruptorIDV,
            estado: estadoInterruptor
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

})
