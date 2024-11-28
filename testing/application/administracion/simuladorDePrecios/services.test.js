
import { describe, expect, test } from '@jest/globals';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';
import { guardarSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/guardarSimulacion.mjs';
import { eliminarSimulacionPorTestingVI } from '../../../../src/infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorTestingVI.mjs';
import { actualizarSimulacionPorDataGlobal } from '../../../../src/application/administracion/simuladorDePrecios/actualizarSimulacionPorDataGlobal.mjs';
import { insertarAlojamientoEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/alojamiento/insertarAlojamientoEnSimulacion.mjs';
import { insertarServicioEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/servicios/insertarServicioEnSimulacion.mjs';
import { actualizarServicioEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/servicios/actualizarServicioEnSimulacion.mjs';
import { obtenerDetallesDelServicioEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/servicios/obtenerDetallesDelServicioEnSimulacion.mjs';
import { eliminarServiciosPorTestingVI } from '../../../../src/infraestructure/repository/servicios/eliminarServiciosPorTestingVI.mjs';
import { eliminarServicioEnSimulacion } from '../../../../src/application/administracion/simuladorDePrecios/servicios/eliminarServicioEnSimulacion.mjs';
import { crearServicio } from '../../../../src/application/administracion/servicios/crearServicio.mjs';
import { actualizarEstadoServicio } from '../../../../src/application/administracion/servicios/actualizarEstadoServicio.mjs';
import { detallesServicio } from '../../../../src/application/administracion/servicios/detallesServicio.mjs';
import { DateTime } from 'luxon';

describe('services of simulation', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let simulacionUID
    let servicioUID
    let servicioUID_enSimulacion
    let servicioTemporal
    const fechaCreacionVirtual = DateTime.utc().toISO();
    const fechaInicioVirutal = DateTime.fromISO(fechaCreacionVirtual).minus({ days: 2 }).toISODate();
    const fechaFinalVirtual = DateTime.fromISO(fechaCreacionVirtual).plus({ days: 2 }).toISODate();
    const nombreServicio = "servicio para testing"
    const zonaIDV = "global"
    const estadoIDV = "activado"
    const testingVI = "taxestestinginsimulation"
    const apartamentoIDV = "apartmenttaxestestinginsimulation"
    const apartamentoUI = "Apartamento temporal creado testing taxestestinginsimulation"
    const habitacionIDV = "roomtaxestestinginsimulation"
    const habitacionUI = "Habitacion temporal para testing taxestestinginsimulation"
    const camaIDV = "bedttaxestestinginsimulation"
    const camaUI = "Cama temporal para testing taxestestinginsimulation"
    const contenedorFake = {
        duracionIDV: "rango",
        disponibilidadIDV: "constante",
        tituloPublico: "Pack entretenimiento",
        definicion: "Este pack de entretenimiento es un pack temporal para testing.\n\nEste pack tiene diferentes opciones.\n\nPor favor seleccione las opciones",
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
                        precioOpcion: "100.00"
                    },
                    {
                        nombreOpcion: "Viaje en Tren, desayuno incluido",
                        precioOpcion: "50.00"
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
                        precioOpcion: "50.00"
                    },
                    {
                        nombreOpcion: "Incluir el desayuno",
                        precioOpcion: "10.00"
                    }
                ]
            }
        ],
        fechaInicio: fechaInicioVirutal,
        fechaFinal: fechaFinalVirtual
    }
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        await eliminarSimulacionPorTestingVI(testingVI)
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


    })
    test('create new service with ok', async () => {
        const response = await crearServicio({
            body: {
                nombreServicio,
                zonaIDV,
                contenedor: JSON.parse(JSON.stringify(contenedorFake))
            },
            session: fakeAdminSession
        })

        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        servicioUID = response.nuevoServicioUID

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
            },
            session: fakeAdminSession
        }
        const response = await actualizarSimulacionPorDataGlobal(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })



    test('insert service in simulation with ok', async () => {
        const gruposDeOpciones = servicioTemporal.ok.contenedor.gruposDeOpciones


        const opcionesSeleccionadas = {}
        Object.entries(gruposDeOpciones).forEach(([grupoIDV, contenedor]) => {
            if (!opcionesSeleccionadas.hasOwnProperty(grupoIDV)) {
                opcionesSeleccionadas[grupoIDV] = []
            }
            contenedor.opcionesGrupo.forEach(og => {
                const opcionIDV = og.opcionIDV
                opcionesSeleccionadas[grupoIDV].push(opcionIDV)
            })
        })
        const response = await insertarServicioEnSimulacion({
            body: {
                simulacionUID: String(simulacionUID),
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
        servicioUID_enSimulacion = response.servicio.servicioUID
    })

    test('get service with ok', async () => {

        const response = await obtenerDetallesDelServicioEnSimulacion({
            body: {
                simulacionUID: String(simulacionUID),
                servicioUID_enSimulacion: String(servicioUID_enSimulacion)
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update service in simulation with ok', async () => {
        const gruposDeOpciones = servicioTemporal.ok.contenedor.gruposDeOpciones
        const opcionesSeleccionadas = {}
        Object.entries(gruposDeOpciones).forEach(([grupoIDV, contenedor]) => {
            if (!opcionesSeleccionadas.hasOwnProperty(grupoIDV)) {
                opcionesSeleccionadas[grupoIDV] = []
            }
            contenedor.opcionesGrupo.forEach(og => {
                const opcionIDV = og.opcionIDV
                opcionesSeleccionadas[grupoIDV].push(opcionIDV)
            })
        })

        const response = await actualizarServicioEnSimulacion({
            body: {
                simulacionUID: String(simulacionUID),
                servicioUID_enSimulacion: String(servicioUID_enSimulacion),
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


    test('delete service in simulation with ok', async () => {

        const response = await eliminarServicioEnSimulacion({
            body: {
                servicioUID_enSimulacion: String(servicioUID_enSimulacion),
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarServiciosPorTestingVI(testingVI)
        await eliminarSimulacionPorTestingVI(testingVI)
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
    })

})
