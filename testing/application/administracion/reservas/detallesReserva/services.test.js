
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarServiciosPorTestingVI } from '../../../../../src/infraestructure/repository/servicios/eliminarServiciosPorTestingVI.mjs';
import { insertarServicioEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/servicios/insertarServicioEnReserva.mjs';
import { eliminarServicioEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/servicios/eliminarServicioEnReserva.mjs';
import { crearServicio } from '../../../../../src/application/administracion/servicios/crearServicio.mjs';

describe('services in bookins', () => {
    const fakeAdminSession = {
        usuario: "userfortesting",
        rolIDV: "administrador"
    }
    let reservaUID
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"
    const testingVI = "serviciotesting"
    const nombreServicio = "servicio para testing"
    const zonaIDV = "global"
    const estadoIDV = "activado"
    const contenedor = {
        precio: "10.00",
        definicion: "Este servicio incluye servicio de recogida desde el aeropuerto a Casa Vitini y servicio de vuelva al aeropuerto en transporte privado.\n",
        fechaFinal: "2024-09-28",
        duracionIDV: "rango",
        fechaInicio: "2024-09-18",
        tituloPublico: "Servicio de transporte de ida y vuelva al aeropuerto - nombre externo",
        disponibilidadIDV: "constante"
    }
    let servicioUID
    let servicioUID_enReserva


    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarServiciosPorTestingVI(testingVI)
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

        const reserva = await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: "2026-10-10",
                fechaSalida: "2026-10-20",
                apartamentos: [apartamentoIDV],
                estadoInicialIDV: "confirmada",
                estadoInicialOfertasIDV: "noAplicarOfertas"

            },
            session: fakeAdminSession
        })
        reservaUID = reserva.reservaUID
    })

    test('create new service with ok', async () => {
        const newClient = {
            body: {
                nombreServicio,
                zonaIDV,
                contenedor
            },
            session: fakeAdminSession
        }
        const response = await crearServicio(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        servicioUID = response.nuevoServicioUID
    })

    test('insert service in booking with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                servicioUID: String(servicioUID)
            },
            session: fakeAdminSession
        }
        const response = await insertarServicioEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        servicioUID_enReserva = response.servicio.servicioUID

    })


    test('delete service in booking with ok', async () => {
        const m = {
            body: {
                servicioUID_enReserva
            },
            session: fakeAdminSession
        }
        const response = await eliminarServicioEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarServiciosPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
