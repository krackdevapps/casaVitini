
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

    beforeAll(async () => {
        await eliminarServiciosPorTestingVI(testingVI)
        process.env.TESTINGVI = testingVI;
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

    test('update service with ok', async () => {
        const newClient = {
            body: {
                nombreServicio,
                zonaIDV,
                contenedor,
                servicioUID
            },
            session: fakeAdminSession
        }
        const response = await actualizarServicio(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get service with ok', async () => {
        const newClient = {
            body: {
                servicioUID
            },
            session: fakeAdminSession
        }
        const response = await detallesServicio(newClient)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update status of service with ok', async () => {
        const newClient = {
            body: {
                servicioUID,
                estadoIDV
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoServicio(newClient)
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