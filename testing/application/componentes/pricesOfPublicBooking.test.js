
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { precioReservaPublica } from '../../../src/application/componentes/precioReservaPublica.mjs';
import { DateTime } from 'luxon';

describe('Prices of public booking', () => {
    const apartamentoIDV = "apartmentpriceofpublicbooking"
    const apartamentoUI = "Apartamento temporal creado para priceofpublicbooking"
    const habitacionIDV = "temporalroompriceofpublicbooking"
    const habitacionUI = "Habitacion temporal para testing priceofpublicbooking"
    const camaIDV = "temporalbedpriceofpublicbooking"
    const camaUI = "Cama temporal para testing priceofpublicbooking"

    beforeAll(async () => {

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: apartamentoUI,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI,
            camaIDV: camaIDV,
            camaUI: camaUI,
        })
    })

    const fechaCreacionVirtual = DateTime.utc().toISO();

    const fechaInicioVirutal = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    const fechaFinalVirtual = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();
    const fakeBooking = {
        fechaEntrada: fechaInicioVirutal,
        fechaSalida: fechaFinalVirtual,
        alojamiento: {
            [apartamentoIDV]: {
                apartamentoUI: apartamentoUI,
                habitaciones: {
                    [habitacionIDV]: {
                        habitacionUI: habitacionUI,
                        configuraciones: {
                            configuracion1: {
                                camaIDV,
                                camaUI,
                                capacidad: "3"
                            },
                        }
                    }
                }
            }
        }
    }

    test('get price for publick booking', async () => {
        const m = {
            body: {
                reserva: fakeBooking
            }
        }
        const response = await precioReservaPublica(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

    });

})
