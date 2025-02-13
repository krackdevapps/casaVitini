
import { describe, expect, test } from '@jest/globals';
import { diasOcupadosTotalmentePorMes } from '../../../src/application/componentes/diasOcupadosTotalmentePorMes.mjs';
import { DateTime } from 'luxon';

describe('daysFullByMonth', () => {

    test('get data of public view', async () => {
        const fechaCreacionVirtual = DateTime.utc().toISO();
        const mes = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).month;
        const año = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).year;
        const response = await diasOcupadosTotalmentePorMes({
            body: {
                mes: mes,
                ano: año
            }
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get past data of public view with error', async () => {
        let response
        try {
            const fechaCreacionVirtual = DateTime.utc().toISO();
            const año = DateTime.fromISO(fechaCreacionVirtual).minus({ year: 2 }).year;
            response = await diasOcupadosTotalmentePorMes({
                body: {
                    mes: 1,
                    ano: año
                }
            })
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })

})
