
import { describe, expect, test } from '@jest/globals';
import { obtenerReservasDelCliente } from '../../../logica/repositorio/clientes/obtenerReservasDelCliente.mjs';
import { insertarComportamientoDePrecio } from '../../../logica/repositorio/comportamientoDePrecios/insertarComportamientoDePrecio.mjs';
import { insertarApartamentoComoEntidad } from '../../../logica/repositorio/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { insertarConfiguracionApartamento } from '../../../logica/repositorio/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { eliminarApartamentoComoEntidad } from '../../../logica/repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../logica/repositorio/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { actualizarEstadoDelComportamientoDePrecio } from '../../../logica/repositorio/comportamientoDePrecios/actualizarEstadoDelComportamientoDePrecio.mjs';
import { actualizarComportamientoDePrecio } from '../../../logica/repositorio/comportamientoDePrecios/actualizarComportamientoDePrecio.mjs';
import { obtenerComportamientoDePrecioPorComportamientoUID } from '../../../logica/repositorio/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs';
import { obtenerNombreComportamientoPorNombreUI } from '../../../logica/repositorio/comportamientoDePrecios/obtenerComportamientoPorNombreUI.mjs';
import { obtenerComportamientosDistintosPorNombreUI } from '../../../logica/repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorNombreUI.mjs';
import { obtenerComportamientosDistintosPorTipoIDVPorDiasArray } from '../../../logica/repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorTipoIDVPorDiasArray.mjs';
import { obtenerComportamientosPorRangoPorTipoIDV } from '../../../logica/repositorio/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs';
import { obtenerComportamientosPorTipoIDVPorDiasArray } from '../../../logica/repositorio/comportamientoDePrecios/obtenerComportamientosPorTipoIDVPorDiasArray.mjs';
import { obtenerComportamientosOrdenadorPorFechaInicio } from '../../../logica/repositorio/comportamientoDePrecios/obtenerTodosComportamientosOrdenadorPorFechaInicio.mjs';
import { eliminarComportamientoPorComportamientoUID } from '../../../logica/repositorio/comportamientoDePrecios/eliminarComportamientoPorComportamientoUID.mjs';
import { eliminarComportamientoPorTestingVI } from '../../../logica/repositorio/comportamientoDePrecios/eliminarComportamientoPorTestingVI.mjs';

describe('crud prices behavior by range', () => {
    const testingVI = "clienteTest"
    const nombreComportamiento = "comportamientoTest"
    const fechaInicio = "2020-01-01"
    const fechaFinal = "2022-01-01"
    const porRangoTVI = "porRangoTVI"
    const porDiasTVI = "porDiasTVI"
    const comportamientoTVI = "comportamientoTest"
    const apartamentoTest = "apartamentoTEST"
    const tipoComportamineto = "porRango"
    let nuevoComportamientoUID = 0

    beforeAll(async () => {
        await eliminarComportamientoPorTestingVI(comportamientoTVI)
        await eliminarApartamentoComoEntidad(apartamentoTest)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoTest)

        await insertarApartamentoComoEntidad({
            apartamentoIDV: apartamentoTest,
            apartamentoUI: "apartamento para test",
        })
        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoTest,
            estadoInicial: "nodisponible",
            zonaIDV: "global"
        })

    })
    test('insert new price by range', async () => {
        const response = await insertarComportamientoDePrecio({
            nombreComportamiento: nombreComportamiento,
            fechaInicio_ISO: fechaInicio,
            fechaFinal_ISO: fechaFinal,
            tipo: porRangoTVI,
            comportamientoTVI: comportamientoTVI,
            diasArray: null,
            contenedor: {
                tipo: "porRango",
                fechaFinal: "2024-09-06",
                fechaInicio: "2024-09-04",
                apartamentos: [
                  {
                    cantidad: "15.00",
                    simboloIDV: "precioEstablecido",
                    apartamentoIDV: "apartamento5"
                  }
                ]
              }
        })
        nuevoComportamientoUID = response.comportamientoUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update status of price behavior', async () => {
        const response = await actualizarEstadoDelComportamientoDePrecio({
            estadoPropuesto: "activado",
            comportamientoUID: nuevoComportamientoUID,
            contenedor: {
                tipo: "porRango",
                fechaFinal: "2024-09-06",
                fechaInicio: "2024-09-04",
                apartamentos: [
                  {
                    cantidad: "15.00",
                    simboloIDV: "precioEstablecido",
                    apartamentoIDV: "apartamento5"
                  }
                ]
              }
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('update price behavior', async () => {
        const response = await actualizarComportamientoDePrecio({
            nombreComportamiento: "comportamientoActualizado",
            fechaInicio_ISO: "3000-10-10",
            fechaFinal_ISO: "3001-10-10",
            tipo: porRangoTVI,
            diasArray: null,
            comportamientoUID: nuevoComportamientoUID,

        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec reseervas by clienteUID for search', async () => {
        const response = await obtenerReservasDelCliente({
            UIDSreservasComoTitular: [1, 2, 3],
            UIDSreservasComoPernoctante: [1, 2, 3],
            UIDSreservasComoAmbos: [1, 2, 3],
            numeroPorPagina: 10,
            sentidoColumna: "ascendente",
            numeroPagina: 1,
            nombreColumna: "fechaEntrada",
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec price behavior by comportamientoUID', async () => {
        const response = await obtenerComportamientoDePrecioPorComportamientoUID(nuevoComportamientoUID);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe("object");
    })

    test('selec price behavior by nombreUI', async () => {
        const response = await obtenerNombreComportamientoPorNombreUI(nombreComportamiento);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec price behavior by others nombreUI', async () => {
        const response = await obtenerComportamientosDistintosPorNombreUI({
            nombreComportamiento: nombreComportamiento,
            componenteUID: nuevoComportamientoUID
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    // test('selec price behavior others by rango and tipoIDV and comportamientoIDV', async () => {
    //     const response = await obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID({
    //         fechaInicio_ISO: fechaInicio,
    //         fechaFinal_ISO: fechaFinal,
    //         tipoIDV: porRangoTVI,
    //         comportamientoUID: nuevoComportamientoUID,
    //     });
    //     expect(response).not.toBeUndefined();
    //     expect(Array.isArray(response)).toBe(true);
    // })

    test('selec price behavior others by tipoIDV and diasArray', async () => {
        const response = await obtenerComportamientosDistintosPorTipoIDVPorDiasArray({
            tipoIDV: porDiasTVI,
            diasArray: ["lunes"],
            comportamientoUID: nuevoComportamientoUID
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec price behavior by range and tipoIDV', async () => {
        const response = await obtenerComportamientosPorRangoPorTipoIDV({
            tipoIDV: porDiasTVI,
            fechaInicio: fechaInicio,
            fechaFinal: fechaFinal
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })


    test('selec price behavior by tipoIDV and diasArray', async () => {
        const response = await obtenerComportamientosPorTipoIDVPorDiasArray({
            tipoIDV: porDiasTVI,
            diasArray: ["lunes"]
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec price behavior by date start and order by asc', async () => {
        const response = await obtenerComportamientosOrdenadorPorFechaInicio();
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })



    test('delete price behavior by comportamientoUID', async () => {
        const response = await eliminarComportamientoPorComportamientoUID(nuevoComportamientoUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await eliminarComportamientoPorTestingVI(comportamientoTVI)
        await eliminarApartamentoComoEntidad(apartamentoTest)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoTest)
    });
})
