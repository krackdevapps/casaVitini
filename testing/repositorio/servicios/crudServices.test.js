
import { describe, expect, test } from '@jest/globals';
import { eliminarServiciosPorTestingVI } from '../../../src/infraestructure/repository/servicios/eliminarServiciosPorTestingVI.mjs';
import { insertarServicio } from '../../../src/infraestructure/repository/servicios/insertarServicio.mjs';
import { actualizarEstadoServicioPorServicioUID } from '../../../src/infraestructure/repository/servicios/actualizarEstadoServicioPorServicioUID.mjs';
import { actualizarServicioPorServicioUID } from '../../../src/infraestructure/repository/servicios/actualizarServicioPorServicioUID.mjs';
import { obtenerServicioPorCriterioPublico } from '../../../src/infraestructure/repository/servicios/obtenerServicioPorCriterioPublico.mjs';
import { obtenerServicioPorCriterioPublicoPorServicioUIDArray } from '../../../src/infraestructure/repository/servicios/obtenerServicioPorCriterioPublicoPorServicioUIDArray.mjs';
import { obtenerServicioPorServicioUID } from '../../../src/infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs';
import { obtenerServiciosConOrdenamiento } from '../../../src/infraestructure/repository/servicios/obtenerServiciosConOrdenamiento.mjs';
import { obtenerTodosLosServicio } from '../../../src/infraestructure/repository/servicios/obtenerTodosLosServicio.mjs';
import { eliminarServicioPorServicioUID } from '../../../src/infraestructure/repository/servicios/eliminarServicioPorServicioUID.mjs';

describe('crud services', () => {
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
    })
    test('insert new service', async () => {
        const response = await insertarServicio({
            nombreServicio: nombreServicio,
            zonaIDV: zonaIDV,
            contenedor: contenedor,
            estadoIDV: "activado"
        })
        servicioUID = response.servicioUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update status service', async () => {
        const response = await actualizarEstadoServicioPorServicioUID({
            servicioUID: servicioUID,
            estadoIDV: estadoIDV,
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update data of service', async () => {
        const response = await actualizarServicioPorServicioUID({
            nombreServicio: nombreServicio,
            zonaIDV: zonaIDV,
            contenedor: contenedor,
            servicioUID: servicioUID,
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec service by public criterion', async () => {
        const response = await obtenerServicioPorCriterioPublico({
            zonaIDVArray: [zonaIDV],
            estadoIDV: "activado"
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec service by public criterion and serviceUID array', async () => {
        const response = await obtenerServicioPorCriterioPublicoPorServicioUIDArray({
            zonaIDVArray: [zonaIDV],
            estadoIDV: "activado",
            serviciosUIDArray: [servicioUID]
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec service by serviceUID', async () => {
        const response = await obtenerServicioPorServicioUID(servicioUID);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec service by search criterion', async () => {
        const response = await obtenerServiciosConOrdenamiento({
            nombreColumna: "servicioUID",
            sentidoColumna: "ascendente",
            numeroPagina: 1,
            numeroPorPagina: 10,
        }); expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec all services', async () => {
        const response = await obtenerTodosLosServicio();
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('delete service by servicioUID', async () => {
        const response = await eliminarServicioPorServicioUID(servicioUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await eliminarServiciosPorTestingVI(testingVI)
    });
})
