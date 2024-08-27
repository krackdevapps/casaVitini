
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../logica/zonas/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarClientePorTestingVI } from '../../../../../logica/repositorio/clientes/eliminarClientePorTestingVI.mjs';
import { actualizarSobreControlNoche } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/sobreControlPrecios/actualizarSobreControlNoche.mjs';
import { obtenerDetallesSobreControlNoche } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/sobreControlPrecios/obtenerDetallesSobreControlNoche.mjs';
import { eliminarSobreControlNoche } from '../../../../../logica/zonas/administracion/reservas/detallesReserva/sobreControlPrecios/eliminarSobreControlNoche.mjs';

describe('overridePrices in bookins', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    let habitacionUID
    let apartamentoUID

    const testingVI = "testingpernocatntereserve"
    const apartamentoIDV = "apartmenttestingpernocatntereserve"
    const apartamentoUI = "Apartamento temporal creado testing pernocante"
    const habitacionIDV = "roomtestingpernocatntereserve"
    const habitacionUI = "Habitacion temporal para testing pernocante"
    const camaIDV = "bedtestingpernocante"
    const camaUI = "Cama temporal para testing pernocante"

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: apartamentoUI,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI,
            camaIDV: camaIDV,
            camaUI: camaUI,
        })

    
        // Crear reserva
        const reserva = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada"

            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID
    })

    test('add override in price of apartment with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: "2026-10-10",
                tipoOperacion: "aumentarPorPorcentaje",
                valorSobreControl: "10.00"
            },
            session: fakeAdminSession
        }
        const response = await actualizarSobreControlNoche(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        habitacionUID = response.nuevoUID
    })

    test('get details override in price of apartment with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: "2026-10-10",
            },
            session: fakeAdminSession
        }
        const response = await obtenerDetallesSobreControlNoche(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        habitacionUID = response.nuevoUID
    })
    test('delete details override in price of apartment with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                apartamentoIDV: apartamentoIDV,
                fechaNoche: "2026-10-10",
            },
            session: fakeAdminSession
        }
        const response = await eliminarSobreControlNoche(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        habitacionUID = response.nuevoUID
    })
    afterAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
