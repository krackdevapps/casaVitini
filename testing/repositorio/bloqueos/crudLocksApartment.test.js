
import { describe, expect, test } from '@jest/globals';
import { insertarNuevoBloqueo } from '../../../src/infraestructure/repository/bloqueos/insertarNuevoBloqueo.mjs';
import { actualizarBloqueoPorBloqueoUID } from '../../../src/infraestructure/repository/bloqueos/actualizarBloqueoPorBloqueoUID.mjs';
import { obtenerBloqueosPorTipoIDVPorApartamentoIDV } from '../../../src/infraestructure/repository/bloqueos/obtenerBloqueosPorTipoIDVPorApartamentoIDV.mjs';
import { obtenerBloqueoPorBloqueoUIDPorApartamentoIDV } from '../../../src/infraestructure/repository/bloqueos/obtenerBloqueoPorBloqueoUIDPorApartamentoIDV.mjs';
import { obtenerBloqueoPorBloqueoUID } from '../../../src/infraestructure/repository/bloqueos/obtenerBloqueoPorBloqueoUID.mjs';
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from '../../../src/infraestructure/repository/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs';
import { obtenerBloqueosPorRangoPorApartamentoIDV } from '../../../src/infraestructure/repository/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs';
import { obtenerObtenerBloqueosPorRangoPorTipo } from '../../../src/infraestructure/repository/bloqueos/obtenerObtenerBloqueosPorRangoPorTipo.mjs';
import { obtenerTodosLosBloqueos } from '../../../src/infraestructure/repository/bloqueos/obtenerTodosLosBloqueos.mjs';
import { eliminarBloqueoPorBloqueoUID } from '../../../src/infraestructure/repository/bloqueos/eliminarBloqueoPorBloqueoUID.mjs';
import { insertarConfiguracionApartamento } from '../../../src/infraestructure/repository/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../src/infraestructure/repository/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { eliminarApartamentoComoEntidad } from '../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../src/infraestructure/repository/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { obtenerBloqueosPorMes } from '../../../src/infraestructure/repository/bloqueos/obtenerBloqueosPorMes.mjs';
import { obtenerTodosLosbloqueosPorMesPorAnoPorTipo } from '../../../src/infraestructure/repository/bloqueos/obtenerTodosLosbloqueosPorMesPorAnoPorTipo.mjs';
import { eliminarBloqueoPorFechaActual } from '../../../src/infraestructure/repository/bloqueos/eliminarBloqueoPorFechaActual.mjs';
import { eliminarBloqueoPorTestingVI } from '../../../src/infraestructure/repository/bloqueos/eliminarBloqueoPorTestingVI.mjs';

describe('crud locks for apartments', () => {
    const apartamentoIDVInicial = "apartamento1TESTInicialtesting"
    const tipoPermanente = "permanente"
    const tipoRangoTemporal = "rangoTemporal"
    const fechaInicio_ISO = "2025-10-02"
    const fechaFin_ISO = "2026-10-02"
    const zonaIDV = "global"
    const testingVI = "bloqueoTesttesting"
    const mes = "10"
    const ano = "2025"
    const fechaActual_ISO = "2027-10-02"
    let nuevoBloqueoUID = 0

    beforeAll(async () => {
        await eliminarBloqueoPorTestingVI(testingVI)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDVInicial)
        await eliminarApartamentoComoEntidad(apartamentoIDVInicial)

        await insertarApartamentoComoEntidad({
            apartamentoIDV: apartamentoIDVInicial,
            apartamentoUI: "apartametno comom entidad pada test",
        })
        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoIDVInicial,
            estadoInicial: "desactivado",
            zonaIDV: "global"
        })

    })
    test('insert new apartmen lock', async () => {
        const response = await insertarNuevoBloqueo({
            apartamentoIDV: apartamentoIDVInicial,
            tipoBloqueoIDV: tipoRangoTemporal,
            fechaInicio: fechaInicio_ISO,
            fechaFin: fechaFin_ISO,
            motivo: "Bloqueo creado durante la prueba de test",
            zonaIDV: zonaIDV,
            testingVI: testingVI
        })
        nuevoBloqueoUID = response.bloqueoUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');

    })
    test('update lock', async () => {
        const response = await actualizarBloqueoPorBloqueoUID({
            apartamentoIDV: apartamentoIDVInicial,
            tipoBloqueoIDV: tipoRangoTemporal,
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
            zonaBloqueoIDV_array: [zonaIDV]
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
        const response = await eliminarBloqueoPorFechaActual(fechaActual_ISO);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    test('delete lock by bloqueoUID', async () => {
        const response = await eliminarBloqueoPorBloqueoUID(nuevoBloqueoUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })



    afterAll(async () => {
        await eliminarBloqueoPorTestingVI(testingVI)
        await eliminarApartamentoComoEntidad(apartamentoIDVInicial)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDVInicial)

    });
})
