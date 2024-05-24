
import { describe, expect, test } from '@jest/globals';
import { insertarNuevoBloqueo } from '../../../logica/repositorio/bloqueos/insertarNuevoBloqueo.mjs';
import { eliminarBloqueoPorBloqueoIDV } from '../../../logica/repositorio/bloqueos/eliminarBloqueoPorBloqueoIDV.mjs';
import { actualizarBloqueoPorBloqueoUID } from '../../../logica/repositorio/bloqueos/actualizarBloqueoPorBloqueoUID.mjs';
import { obtenerBloqueosPorTipoIDVPorApartamentoIDV } from '../../../logica/repositorio/bloqueos/obtenerBloqueosPorTipoIDVPorApartamentoIDV.mjs';
import { obtenerBloqueoPorBloqueoUIDPorApartamentoIDV } from '../../../logica/repositorio/bloqueos/obtenerBloqueoPorBloqueoUIDPorApartamentoIDV.mjs';
import { obtenerBloqueoPorBloqueoUID } from '../../../logica/repositorio/bloqueos/obtenerBloqueoPorBloqueoUID.mjs';
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from '../../../logica/repositorio/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs';
import { obtenerBloqueosPorRangoPorApartamentoIDV } from '../../../logica/repositorio/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs';
import { obtenerObtenerBloqueosPorRangoPorTipo } from '../../../logica/repositorio/bloqueos/obtenerObtenerBloqueosPorRangoPorTipo.mjs';
import { obtenerTodosLosBloqueos } from '../../../logica/repositorio/bloqueos/obtenerTodosLosBloqueos.mjs';
import { eliminarBloqueoPorBloqueoUID } from '../../../logica/repositorio/bloqueos/eliminarBloqueoPorBloqueoUID.mjs';
import { eliminarBloqueoPorFechaSalida } from '../../../logica/repositorio/bloqueos/eliminarBloqueoPorFechaSalida.mjs';
import { insertarConfiguracionApartamento } from '../../../logica/repositorio/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../logica/repositorio/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { eliminarApartamentoComoEntidad } from '../../../logica/repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../logica/repositorio/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { obtenerBloqueosPorMes } from '../../../logica/repositorio/bloqueos/obtenerBloqueosPorMes.mjs';
import { obtenerTodosLosbloqueosPorMesPorAnoPorTipo } from '../../../logica/repositorio/bloqueos/obtenerTodosLosbloqueosPorMesPorAnoPorTipo.mjs';
describe('crud locks for apartments', () => {
    const apartamentoIDVInicial = "apartamento1TESTInicial"
    const tipoPermanente = "permanente"
    const tipoRangoTemporal = "rangoTemporal"
    const fechaInicio_ISO = "2025-10-02"
    const fechaFin_ISO = "2026-10-02"
    const zonaIDV = "global"
    const bloqueoIDV = "bloqueoTest"
    const mes = "10"
    const ano = "2025"
    const fechaActual_ISO = "2027-10-02"
    let nuevoBloqueoUID = 0

    beforeAll(async () => {
        await eliminarBloqueoPorBloqueoIDV(bloqueoIDV)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDVInicial)
        await eliminarApartamentoComoEntidad(apartamentoIDVInicial)

        await insertarApartamentoComoEntidad({
            apartamentoIDV: apartamentoIDVInicial,
            apartamentoUI: "apartametno comom entidad pada test",
        })
        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoIDVInicial,
            estadoInicial: "nodisponible",
        })

    })
    test('insert new apartmen lock', async () => {
        const response = await insertarNuevoBloqueo({
            apartamentoIDV: apartamentoIDVInicial,
            tipoBloqueo: tipoRangoTemporal,
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFin_ISO: fechaFin_ISO,
            motivo: "Bloqueo creado durante la prueba de test",
            zonaIDV: zonaIDV,
            bloqueoIDV: bloqueoIDV
        })
        nuevoBloqueoUID = response.bloqueoUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('update lock', async () => {
        const response = await actualizarBloqueoPorBloqueoUID({
            apartamentoIDV: apartamentoIDVInicial,
            tipoBloqueo: tipoRangoTemporal,
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFin_ISO: fechaFin_ISO,
            motivo: "Bloqueo creado durante la prueba de test",
            zonaIDV: zonaIDV,
            bloqueoUID: nuevoBloqueoUID
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test('selec lock by bloqueoUID', async () => {
        const response = await obtenerBloqueoPorBloqueoUID(nuevoBloqueoUID);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec lock by bloqueoUID and apartametnoIDV', async () => {
        const response = await obtenerBloqueoPorBloqueoUIDPorApartamentoIDV({
            apartamentoIDV: apartamentoIDVInicial,
            bloqueoUID: nuevoBloqueoUID
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec lock by bloqueoUID and tipoBloqueoIDV', async () => {
        const response = await obtenerBloqueosPorTipoIDVPorApartamentoIDV({
            apartamentoIDV: apartamentoIDVInicial,
            tipoBloqueoIDV: tipoRangoTemporal
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })


    test('selec lock by tipoBloqueoIDV', async () => {
        const response = await obtenerBloqueosDelApartamentoPorApartamentoIDV(apartamentoIDVInicial);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec lock by month and year', async () => {
        const response = await obtenerBloqueosPorMes({
            mes: mes,
            ano: ano
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })


    test('selec all locks by month and tipo', async () => {
        const response = await obtenerTodosLosbloqueosPorMesPorAnoPorTipo({
            mes: mes,
            ano: ano,

        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })


    test('selec lock by date range and apartametnoIDV', async () => {
        const response = await obtenerBloqueosPorRangoPorApartamentoIDV({
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFinal_ISO: fechaFin_ISO,
            apartamentosIDV_array: [apartamentoIDVInicial],
            zonaBloqueoIDV_array: [tipoRangoTemporal]
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })


    test('selec lock by date range and tipoBloqueoIDV', async () => {
        const response = await obtenerObtenerBloqueosPorRangoPorTipo({
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFinal_ISO: fechaFin_ISO,
            tipoBloqueoIDV: tipoPermanente
        });
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('selec all locks', async () => {
        const response = await obtenerTodosLosBloqueos();
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('delete lock by date', async () => {
        const response = await eliminarBloqueoPorFechaSalida(fechaActual_ISO);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('delete lock by bloqueoUID', async () => {
        const response = await eliminarBloqueoPorBloqueoUID(nuevoBloqueoUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('delete lock by bloqueoUID', async () => {
        const response = await eliminarBloqueoPorBloqueoIDV(apartamentoIDVInicial);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await eliminarBloqueoPorBloqueoIDV(bloqueoIDV)
        await eliminarApartamentoComoEntidad(apartamentoIDVInicial)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDVInicial)

    });
})
