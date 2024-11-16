
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { obtenerDescuentosCompatiblesConLaReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/descuentos/obtenerDescuentosCompatiblesConLaReserva.mjs';
import { DateTime } from 'luxon';
import { eliminarOfertaPorTestingVI } from '../../../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { crearOferta } from '../../../../../src/application/administracion/ofertas/crearOferta.mjs';
import { insertarDescuentoPorAdministrador } from '../../../../../src/application/administracion/reservas/detallesReserva/descuentos/insertarDescuentoPorAdministrador.mjs';
import { actualizarAutorizacionDescuentoCompatible } from '../../../../../src/application/administracion/reservas/detallesReserva/descuentos/actualizarAutorizacionDescuentoCompatible.mjs';
import { insertarDescuentoPorCompatible } from '../../../../../src/application/administracion/reservas/detallesReserva/descuentos/insertarDescuentoPorCompatible.mjs';
import { eliminarDescuentoEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/descuentos/eliminarDescuentoEnReserva.mjs';

describe('discounts in bookins', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let reservaUID
    let ofertaUID
    const testingVI = "testingadddiscountstoreserve"
    const apartamentoIDV = "apartamentfortestingadddiscountstoreserve"
    const apartamentoUI = "Apartamento temporal creado para discounts"
    const habitacionIDV = "temporalroomfortestingadddiscountstoreserve"
    const habitacionUI = "Habitacion temporal para testing discounts"
    const camaIDV = "temporalbedfortestingaddapartamentotoreserve"
    const camaUI = "Cama temporal para testing de discounts"

    const apartamentoIDV_2 = "apartamentfortestingadddiscountstoreservetwo"
    const apartamentoUI_2 = "Apartamento temporal creado para discountsdos"
    const camaUI_2 = "Cama temporal para testing de discountsdos"


    const habitacionIDV_2 = "temporalroomfortestingadddiscountstoreservetwo"
    const habitacionUI_2 = "Habitacion temporal para testing discountsdos"
    const camaIDV_2 = "temporalbedfortestingaddapartamentotoreservetwodos"

    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioVirutal = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 2 }).toISODate();
    const fechaFinalVirtual = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    let posicionOfertaInsertada
    const fakeOffer = {
        nombreOferta: "oferta creadad para testing",
        zonaIDV: "global",
        entidadIDV: "reserva",
        fechaInicio: fechaInicioVirutal,
        fechaFinal: fechaFinalVirtual,
        condicionesArray: [
            {
                "tipoCondicion": "conFechaCreacionEntreRango"
            },
        ],
        descuentosJSON: {
            "tipoDescuento": "totalNeto",
            "tipoAplicacion": "porcentaje",
            "descuentoTotal": "10.00"
        }
    }

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2,
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await eliminarOfertaPorTestingVI(testingVI)
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
        await makeHostArquitecture({
            operacion: "construir",
            apartamentoIDV: apartamentoIDV_2,
            apartamentoUI: apartamentoUI_2,
            habitacionIDV: habitacionIDV_2,
            habitacionUI: habitacionUI_2,
            camaIDV: camaIDV_2,
            camaUI: camaUI_2,
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
    test('create offer compatible with booking with ok', async () => {
        const m = {
            body: {
                ...fakeOffer
            },
            session: fakeAdminSession
        }
        const response = await crearOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        ofertaUID = response.oferta.ofertaUID
    })


    test('get all discounts compatibles with bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
            },
            session: fakeAdminSession
        }
        const response = await obtenerDescuentosCompatiblesConLaReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('insert compatible discount in bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID),

            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorCompatible(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('insert administrativie discount in bookin with ok', async () => {
        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID),

            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorAdministrador(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update autorization in compatible discount in bookin with ok', async () => {

        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID),
                nuevaAutorizacion: "aceptada"

            },
            session: fakeAdminSession
        }
        const response = await actualizarAutorizacionDescuentoCompatible(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('delete discount in bookin with ok', async () => {

        const m = {
            body: {
                reservaUID: String(reservaUID),
                ofertaUID: String(ofertaUID),
                posicion: "1",
                origen: "porAdministrador"

            },
            session: fakeAdminSession
        }
        const response = await eliminarDescuentoEnReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    afterAll(async () => {
        await eliminarOfertaPorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV_2,
            habitacionIDV: habitacionIDV_2,
            camaIDV: camaIDV_2,
        })
    })

})
