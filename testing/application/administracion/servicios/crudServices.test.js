
import { describe, expect, test } from '@jest/globals';
import { eliminarServiciosPorTestingVI } from '../../../../src/infraestructure/repository/servicios/eliminarServiciosPorTestingVI.mjs';
import { crearServicio } from '../../../../src/application/administracion/servicios/crearServicio.mjs';
import { detallesServicio } from '../../../../src/application/administracion/servicios/detallesServicio.mjs';
import { actualizarServicio } from '../../../../src/application/administracion/servicios/actualizarServicio.mjs';
import { actualizarEstadoServicio } from '../../../../src/application/administracion/servicios/actualizarEstadoServicio.mjs';
import { listaServiciosPaginados } from '../../../../src/application/administracion/servicios/listaServiciosPaginados.mjs';
import { eliminarServicio } from '../../../../src/application/administracion/servicios/eliminarServicio.mjs';
import { obtenerServicios } from '../../../../src/application/administracion/servicios/obtenerServicios.mjs';

describe('services clients', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "serviciotesting"
    const nombreServicio = "servicio para testing"
    const zonaIDV = "global"
    const estadoIDV = "activado"
    const contenedorFake = {
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
        fechaInicio: "2024-11-13",
        fechaFinal: "2024-11-23"
    }
    let servicioUID
    beforeAll(async () => {
        await eliminarServiciosPorTestingVI(testingVI)
        process.env.TESTINGVI = testingVI;
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
    test('update service with ok', async () => {
      

        const response = await actualizarServicio( {
            body: {
                nombreServicio,
                zonaIDV,
                contenedor: contenedorFake,
                servicioUID
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

    test('get list of services by criterion with ok', async () => {
        const newClient = {
            body: {
                nombreColumna: "servicioUID",
                sentidoColumna: "ascendente",
                pagina: 1,
            },
            session: fakeAdminSession
        }
        const response = await listaServiciosPaginados(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all services with ok', async () => {
        const response = await obtenerServicios({
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete service by servicioUID with ok', async () => {
        const newClient = {
            body: {
                servicioUID
            },
            session: fakeAdminSession
        }
        const response = await eliminarServicio(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarServiciosPorTestingVI(testingVI)
    });
})
