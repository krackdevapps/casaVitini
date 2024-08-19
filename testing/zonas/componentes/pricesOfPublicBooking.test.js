
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { precioReservaPublica } from '../../../logica/zonas/componentes/precioReservaPublica.mjs';

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
    const fakeBooking = {
        fechaEntrada: "2024-10-11",
        fechaSalida: "2024-10-12",
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
                reserva:fakeBooking
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
