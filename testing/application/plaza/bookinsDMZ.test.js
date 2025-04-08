
import { describe, expect, test } from '@jest/globals';
import { eliminarReservaPorTestingVI } from '../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { makeHostArquitecture } from '../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarClientePorTestingVI } from '../../../src/infraestructure/repository/clientes/eliminarClientePorTestingVI.mjs';
import { apartamentosDisponiblesPublico } from '../../../src/application/plaza/reservas/apartamentosDisponiblesPublico.mjs';
import { DateTime } from 'luxon';
import { preciosPorSeleccion } from '../../../src/application/plaza/reservas/preciosPorSeleccion.mjs';
import { establecerNuevoPrecioApartamento } from '../../../src/application/administracion/precios/establecerNuevoPrecioApartamento.mjs';
import { preComprobarCodigoDescuento } from '../../../src/application/plaza/reservas/preComprobarCodigoDescuento.mjs';
import { crearOferta } from '../../../src/application/administracion/ofertas/crearOferta.mjs';
import { actualizarEstadoOferta } from '../../../src/application/administracion/ofertas/actualizarEstadoOferta.mjs';
import { eliminarOfertaPorTestingVI } from '../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { preConfirmarReserva } from '../../../src/application/plaza/reservas/preConfirmarReserva.mjs';
import { obtenerComplementosPorAlojamiento } from '../../../src/application/administracion/complementosDeAlojamiento/obtenerComplementosPorAlojamiento.mjs';
import { eliminarServiciosPorTestingVI } from '../../../src/infraestructure/repository/servicios/eliminarServiciosPorTestingVI.mjs';
import { crearServicio } from '../../../src/application/administracion/servicios/crearServicio.mjs';
import { actualizarEstadoServicio } from '../../../src/application/administracion/servicios/actualizarEstadoServicio.mjs';
import { detallesServicio } from '../../../src/application/administracion/servicios/detallesServicio.mjs';

describe('miCasa bookins', () => {

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

    const fechaInicioVirutal_service = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 2 }).toISODate();
    const fechaFinalVirtual_service = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();

    const fechaInicioVirutal = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    const fechaFinalVirtual = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();

    const codeOffer = "testingDMZBookinmethods"
    let servicioUID
    let servicioTemporal
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

    const contenedorFakeService = {
        duracionIDV: "rango",
        disponibilidadIDV: "constante",
        tituloPublico: "Pack entretenimiento",
        definicion: "dGVzdA==",
        gruposDeOpciones: [
            {
                nombreGrupo: "Viaje a Francia",
                configuracionGrupo: {
                    confSelObligatoria: [
                        "unaObligatoria"
                    ],
                    confSelNumero: [
                        "variasOpcionesAlMismoTiempo"
                    ]
                },
                opcionesGrupo: [
                    {
                        nombreOpcion: "Viaje en avión, restaurante includio",
                        precioOpcion: "100.00",
                        interruptorCantidad: "desactivado"
                    },
                    {
                        nombreOpcion: "Viaje en Tren, desayuno incluido",
                        precioOpcion: "50.00",
                        interruptorCantidad: "desactivado"
                    }
                ]
            },
            {
                nombreGrupo: "Viaje a Alemania",
                configuracionGrupo: {
                    confSelObligatoria: [
                        "unaObligatoria"
                    ],
                    confSelNumero: [
                        "variasOpcionesAlMismoTiempo"
                    ]
                },
                opcionesGrupo: [
                    {
                        nombreOpcion: "Viaje en Tren",
                        precioOpcion: "50.00",
                        interruptorCantidad: "desactivado"
                    },
                    {
                        nombreOpcion: "Incluir el desayuno",
                        precioOpcion: "10.00",
                        interruptorCantidad: "desactivado"
                    }
                ]
            }
        ],
        fechaInicio: fechaInicioVirutal_service,
        fechaFinal: fechaFinalVirtual_service
    }

    const fakeService = {
        nombreServicio: "servicio para testing",
        zonaIDV: "global",
        contenedor: contenedorFakeService
    }

    beforeAll(async () => {

        process.env.TESTINGVI = testingVI
        await eliminarClientePorTestingVI(testingVI)
        await eliminarReservaPorTestingVI(testingVI)
        await eliminarOfertaPorTestingVI(testingVI)
        await eliminarServiciosPorTestingVI(testingVI)

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

        const newTemporalService = await crearServicio({
            body: {
                ...fakeService
            },
            session: fakeAdminSession
        })
        servicioUID = newTemporalService.nuevoServicioUID

        await actualizarEstadoServicio({
            body: {
                servicioUID,
                estadoIDV: "activado"
            },
            session: fakeAdminSession
        })
        servicioTemporal = await detallesServicio({
            body: {
                servicioUID: servicioUID
            },
            session: fakeAdminSession
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
                tipoRango: "personalizado"

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
                codigoDescuento: [codeOffer],
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

    let complementoAlojaminetoUID

    test('get complement of hosting', async () => {
        const m = {
            body: {
                apartamentoIDV: apartamentoIDV,
                filtro: "soloActivos"
            },
            session: fakeAdminSession
        }
        const response = await obtenerComplementosPorAlojamiento(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        complementoAlojaminetoUID = response.complementosPorApartamentoIDV[0].complementoUID
    })
    test('confirm bookin from DMZ with ok', async () => {
        const gruposDeOpciones = servicioTemporal.ok.contenedor.gruposDeOpciones

        const opcionesSeleccionadas = {}
        Object.entries(gruposDeOpciones).forEach(([grupoIDV, contenedor]) => {
            if (!opcionesSeleccionadas.hasOwnProperty(grupoIDV)) {
                opcionesSeleccionadas[grupoIDV] = []
            }
            contenedor.opcionesGrupo.forEach(og => {

                opcionesSeleccionadas[grupoIDV].push({
                    opcionIDV: og.opcionIDV,
                    cantidad: "1"
                })
            })
        })
        const m = {
            body: {
                codigoDescuento: codeOffer,
                reserva: {
                    fechaEntrada: fechaInicioVirutal,
                    fechaSalida: fechaFinalVirtual,
                    alojamiento: {
                        [apartamentoIDV]: {
                            habitaciones: {
                                [habitacionIDV]: {
                                    camaSeleccionada: {
                                        camaIDV: camaIDV
                                    }
                                }
                            }
                        }
                    },
                    complementosAlojamiento: [
                        {
                            complementoUI: "Complemento temporal para testing",
                            complementoUID: complementoAlojaminetoUID
                        },
                    ],
                    servicios: [
                        {
                            servicioUID: servicioUID,
                            opcionesSeleccionadas
                        }
                    ],
                    titular: {
                        nombreTitular: "test",
                        correoTitular: "test@test.com",
                        telefonoTitular: "3333",
                        codigoInternacional: "+1"
                    }
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
        await eliminarServiciosPorTestingVI(testingVI)

        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
