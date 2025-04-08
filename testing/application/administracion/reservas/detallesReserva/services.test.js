
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../../sharedUsesCases/makeHostArquitecture.mjs';
import { eliminarReservaPorTestingVI } from '../../../../../src/infraestructure/repository/reservas/reserva/eliminarReservaPorTestingVI.mjs';
import { crearReservaSimpleAdministrativa } from '../../../../../src/application/administracion/reservas/nuevaReserva/crearReservaSimpleAdministrativa.mjs';
import { eliminarServiciosPorTestingVI } from '../../../../../src/infraestructure/repository/servicios/eliminarServiciosPorTestingVI.mjs';
import { insertarServicioEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/servicios/insertarServicioEnReserva.mjs';
import { eliminarServicioEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/servicios/eliminarServicioEnReserva.mjs';
import { crearServicio } from '../../../../../src/application/administracion/servicios/crearServicio.mjs';
import { detallesServicio } from '../../../../../src/application/administracion/servicios/detallesServicio.mjs';
import { actualizarServicioEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/servicios/actualizarServicioEnReserva.mjs';
import { obtenerDetallesDelServicioEnReserva } from '../../../../../src/application/administracion/reservas/detallesReserva/servicios/obtenerDetallesDelServicioEnReserva.mjs';
import { obtenerServiciosDisponibles } from '../../../../../src/application/administracion/reservas/detallesReserva/servicios/obtenerServiciosDisponibles.mjs';
import { actualizarEstadoServicio } from '../../../../../src/application/administracion/servicios/actualizarEstadoServicio.mjs';
import { DateTime } from 'luxon';

describe('services in bookins', () => {
    const fakeAdminSession = {
        usuario: "userfortesting",
        rolIDV: "administrador"
    }
    let reservaUID
    let servicioTemporal
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
    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioVirtal = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 2 }).toISODate();
    const fechaFinalVirtual = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 3 }).toISODate();
    const contenedor = {
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
        fechaInicio: fechaInicioVirtal,
        fechaFinal: fechaFinalVirtual
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
        const response = await crearServicio({
            body: {
                nombreServicio,
                zonaIDV,
                contenedor
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        servicioUID = response.nuevoServicioUID
    })

    test('update status of service with ok', async () => {

        const response = await actualizarEstadoServicio({
            body: {
                servicioUID,
                estadoIDV
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get service with ok', async () => {

        const response = await detallesServicio({
            body: {
                servicioUID
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        servicioTemporal = response
    })

    test('insert service in booking with ok', async () => {

        const gruposDeOpciones = servicioTemporal.ok.contenedor.gruposDeOpciones


        const opcionesSeleccionadas = {}
        Object.entries(gruposDeOpciones).forEach(([grupoIDV, contenedor]) => {
            if (!opcionesSeleccionadas.hasOwnProperty(grupoIDV)) {
                opcionesSeleccionadas[grupoIDV] = []
            }
            contenedor.opcionesGrupo.forEach(og => {             
                
                opcionesSeleccionadas[grupoIDV].push({
                    opcionIDV: og.opcionIDV,
                    cantidad: "1",
                    tipoDescuento: "sinDescuento",
                    cantidadDescuento: "0.00",
                })
            })
        })

        const response = await insertarServicioEnReserva({
            body: {
                reservaUID: String(reservaUID),
                servicioUID: String(servicioUID),
                opcionesSeleccionadasDelServicio: {
                    servicioUID: String(servicioUID),
                    opcionesSeleccionadas
                }
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        servicioUID_enReserva = response.servicio.servicioUID
    })
    test('update service in booking with ok', async () => {
        const gruposDeOpciones = servicioTemporal.ok.contenedor.gruposDeOpciones


        const opcionesSeleccionadas = {}
        Object.entries(gruposDeOpciones).forEach(([grupoIDV, contenedor]) => {
            if (!opcionesSeleccionadas.hasOwnProperty(grupoIDV)) {
                opcionesSeleccionadas[grupoIDV] = []
            }
            contenedor.opcionesGrupo.forEach(og => {             
                
                opcionesSeleccionadas[grupoIDV].push({
                    opcionIDV: og.opcionIDV,
                    cantidad: "1",
                    tipoDescuento: "sinDescuento",
                    cantidadDescuento: "0.00",
                })
            })
        })

        const response = await actualizarServicioEnReserva({
            body: {
                reservaUID: String(reservaUID),
                servicioUID_enReserva: String(servicioUID_enReserva),
                opcionesSeleccionadasDelServicio: {
                    servicioUID: String(servicioUID),
                    opcionesSeleccionadas
                }
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get detail of service in booking with ok', async () => {
        const response = await obtenerDetallesDelServicioEnReserva({
            body: {
                reservaUID: String(reservaUID),
                servicioUID_enReserva: String(servicioUID_enReserva),
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get services avaibles for booking with ok', async () => {
        const response = await obtenerServiciosDisponibles({
            body: {},
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete service in booking with ok', async () => {
        const m = {
            body: {
                servicioUID_enReserva: String(servicioUID_enReserva),

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
