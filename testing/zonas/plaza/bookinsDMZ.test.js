
import { describe, expect, test } from '@jest/globals';
import { eliminarReservaPorTestingVI } from '../../../logica/repositorio/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarClientePorTestingVI } from '../../../logica/repositorio/clientes/eliminarClientePorTestingVI.mjs';
import { apartamentosDisponiblesPublico } from '../../../logica/zonas/plaza/reservas/apartamentosDisponiblesPublico.mjs';
import { DateTime } from 'luxon';
import { preciosPorSeleccion } from '../../../logica/zonas/plaza/reservas/preciosPorSeleccion.mjs';
import { establecerNuevoPrecioApartamento } from '../../../logica/zonas/administracion/precios/establecerNuevoPrecioApartamento.mjs';
import { preComprobarCodigoDescuento } from '../../../logica/zonas/plaza/reservas/preComprobarCodigoDescuento.mjs';
import { crearOferta } from '../../../logica/zonas/administracion/ofertas/crearOferta.mjs';
import { actualizarEstadoOferta } from '../../../logica/zonas/administracion/ofertas/actualizarEstadoOferta.mjs';
import { eliminarOfertaPorTestingVI } from '../../../logica/repositorio/ofertas/eliminarOfertaPorTestingVI.mjs';
import { preConfirmarReserva } from '../../../logica/zonas/plaza/reservas/preConfirmarReserva.mjs';

describe('miCasa bookins', () => {
    // Cambiar un momento la variable de aceptar reserva y vovler a activar y mirar si tiene algo que ver el hecho de entorno de pruebas.
    const testingVI = "testingbookingmicasa"
    const usuarioIDV_inicial = "userfortestingformicasametodos"
    const fakeAdminSession = {
        usuario: usuarioIDV_inicial,
        rolIDV: "administrador",
    }
    let ofertaUID
    const apartamentoIDV = "apartmenttestingholdinreserve"
    const apartamentoUI = "Apartamento temporal creado testing holder"
    const habitacionIDV = "roomtestingholdinreserve"
    const habitacionUI = "Habitacion temporal para testing holder"
    const camaIDV = "bedtestingholder"
    const camaUI = "Cama temporal para testing holder"

    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioVirutal_offer = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 2 }).toISODate();
    const fechaFinalVirtual_offer = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();


    const fechaInicioVirutal = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    const fechaFinalVirtual = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();
    const codeOffer = "testingDMZBookinmethods"
    const fakeOffer = {
        nombreOferta: "oferta creadada para testing",
        zonaIDV: "global",
        entidadIDV: "reserva",
        fechaInicio: fechaInicioVirutal_offer,
        fechaFinal: fechaFinalVirtual_offer,
        condicionesArray: [
            {
                tipoCondicion: "porCodigoDescuento",
                codigoDescuento: codeOffer
            }
        ],
        descuentosJSON: {
            tipoDescuento: "totalNeto",
            tipoAplicacion: "porcentaje",
            descuentoTotal: "10.00"
        }
    }

    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarClientePorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarOfertaPorTestingVI(testingVI)

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })

        // Crear una primera arquitectura de alojamineto para crear al reserva.
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
    test('get apartments avaibles in DMZ with ok', async () => {
        const m = {
            body: {
                fechaEntrada: fechaInicioVirutal,
                fechaSalida: fechaFinalVirtual,
            }
        }
        const response = await apartamentosDisponiblesPublico(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('update price of hosting configuracion with ok', async () => {
        const m = {
            body: {
                apartamentoIDV,
                nuevoPrecio: "99.99"
            },
            session: fakeAdminSession
        }
        const response = await establecerNuevoPrecioApartamento(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get prices by apartments seleccion in DMZ with ok', async () => {
        const m = {
            body: {
                fechaEntrada: fechaInicioVirutal,
                fechaSalida: fechaFinalVirtual,
                apartamentosIDVARRAY: [apartamentoIDV],

            }
        }
        const response = await preciosPorSeleccion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create offer with ok', async () => {
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
    test('update status of offer with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID),
                estadoIDV: "activado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('validate offer code in string in DMZ with ok', async () => {
        const m = {
            body: {
                tipoContenedorCodigo: "cadena",
                codigoDescuento: codeOffer,
                reserva: {
                    fechaEntrada: fechaInicioVirutal,
                    fechaSalida: fechaFinalVirtual,
                    alojamiento: {
                        [apartamentoIDV]: {
                            apartamentoUI: [apartamentoUI],
                            habitaciones: {
                                [habitacionIDV]: {
                                    habitacionUI: habitacionUI,
                                    configuraciones: {
                                        configuracion1: {
                                            camaIDV: camaIDV,
                                            camaUI: camaUI,
                                            capacidad: 3
                                        },
                                    },
                                    camaSeleccionada: {
                                        camaIDV: camaIDV,
                                        camaUI: camaUI
                                    }
                                }
                            }
                        },

                    },
                }
            }
        }
        const response = await preComprobarCodigoDescuento(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('confirm bookin from DMZ with ok', async () => {
        const m = {
            body: {
                // tipoContenedorCodigo: "cadena",
                codigoDescuento: codeOffer,
                reserva: {
                    fechaEntrada: fechaInicioVirutal,
                    fechaSalida: fechaFinalVirtual,
                    datosTitular: {
                        nombreTitular: "nombre de ejemplo",
                        pasaporteTitular: "pasaporte de ejemplo",
                        correoTitular: "test@test.com",
                        telefonoTitular: "587455474"
                    },
                    alojamiento: {
                        [apartamentoIDV]: {
                            apartamentoUI: apartamentoUI,
                            habitaciones: {
                                [habitacionIDV]: {
                                    habitacionUI: habitacionUI,
                                    configuraciones: {
                                        configuracion1: {
                                            camaIDV: camaIDV,
                                            camaUI: camaUI,
                                            capacidad: 3
                                        },
                                    },
                                    camaSeleccionada: {
                                        camaIDV: camaIDV,
                                        camaUI: camaUI
                                    }
                                }
                            }
                        },
                    },
                }
            }
        }
        const response = await preConfirmarReserva(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarClientePorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarOfertaPorTestingVI(testingVI)

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
