
import { describe, expect, test } from '@jest/globals';
import { obtenerReservasComoLista } from '../../../../src/infraestructure/repository/miCasa/reservas/obtenerReservasComoLista.mjs';

describe('bookings by user', () => {

    test('search bookins of user', async () => {
        const response = await obtenerReservasComoLista({
            reservasUID: [1, 2, 3, 4, 5, 6, 7],
            numeroPorPagina: "10",
            sentidoColumna: "ascendente",
            nombreColumna: "fechaEntrada",
        })
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })
})
