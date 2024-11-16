
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { eliminarOfertaPorTestingVI } from '../../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { crearOferta } from '../../../../src/application/administracion/ofertas/crearOferta.mjs';
import { insertarDescuentoPorAdministrador } from '../../../../src/application/administracion/simuladorDePrecios/descuentos/insertarDescuentoPorAdministrador.mjs';
import { DateTime } from 'luxon';
import { insertarDescuentoPorCompatible } from '../../../../src/application/administracion/simuladorDePrecios/descuentos/insertarDescuentoPorCompatible.mjs';
import { actualizarAutorizacionDescuentoCompatible } from '../../../../src/application/administracion/simuladorDePrecios/descuentos/actualizarAutorizacionDescuentoCompatible.mjs';
import { obtenerDescuentosCompatiblesConLaSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/descuentos/obtenerDescuentosCompatiblesConLaSimulacion.mjs';
import { eliminarDescuentoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/descuentos/eliminarDescuentoEnSimulacion.mjs';
import { actualizarSimulacionPorDataGlobal } from '../../../../src/application/administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal.mjs';
import { insertarAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/alojamiento/insertarAlojamientoEnSimulacion.mjs';

describe('discounts of simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let simulacionUID
    let ofertaUID

    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioVirutal = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 2 }).toISODate();
    const fechaFinalVirtual = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    const testingVI = "globaloperations"
    const apartamentoIDV = "apartmenttestingpricessimulador"
    const apartamentoUI = "Apartamento temporal creado testing pricessimulador"
    const habitacionIDV = "roomtestingpricessimulador"
    const habitacionUI = "Habitacion temporal para testing pricessimulador"
    const camaIDV = "bedtestingpricessimulador"
    const camaUI = "Cama temporal para testing pricessimulador"
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
        await eliminarSimulacionPorTestingVI(testingVI)
        await eliminarOfertaPorTestingVI(testingVI)
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
    test('create initial and save void simulation with ok', async () => {
        const m = {
            body: {
                nombre: "Simulacion temporal y volatil para testing",
            },
            session: fakeAdminSession
        }
        const response = await guardarSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        simulacionUID = response.simulacionUID
    })
    test('insert hostin in simulation with ok', async () => {
        try {
            const response = await insertarAlojamientoEnSimulacion({
                body: {
                    simulacionUID: String(simulacionUID),
                    apartamentoIDV: String(apartamentoIDV)
                },
                session: fakeAdminSession
            })
        } catch (error) {
            expect(error).not.toBeUndefined();
            expect(typeof error).toBe('object');
            expect(error).toHaveProperty('info');
        }
    })
    test('insert global data in simulation created with ok', async () => {
        const m = {
            body: {
                simulacionUID: simulacionUID,
                fechaCreacion: "2026-10-10",
                fechaEntrada: "2026-10-11",
                fechaSalida: "2026-10-14",
                zonaIDV: "global",
                apartamentosIDVARRAY: [apartamentoIDV],
            },
            session: fakeAdminSession
        }
        const response = await actualizarSimulacionPorDataGlobal(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create offer for testing simulation with ok', async () => {
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

    test('insert offer administrative in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                ofertaUID: String(ofertaUID)
            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorAdministrador(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('insert offer compatible in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                ofertaUID: String(ofertaUID)
            },
            session: fakeAdminSession
        }
        const response = await insertarDescuentoPorCompatible(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('update autorization of offer compatible in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
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
    test('get offers compatible in simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID)

            },
            session: fakeAdminSession
        }
        const response = await obtenerDescuentosCompatiblesConLaSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('delete offers of simulation with ok', async () => {
        const m = {
            body: {
                simulacionUID: String(simulacionUID),
                ofertaUID: String(ofertaUID),
                posicion: "1",
                origen: "porAdministrador"

            },
            session: fakeAdminSession
        }
        const response = await eliminarDescuentoEnSimulacion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    afterAll(async () => {
        await eliminarOfertaPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
