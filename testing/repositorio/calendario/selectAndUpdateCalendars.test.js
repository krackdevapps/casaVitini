
import { describe, expect, test } from '@jest/globals';
import { insertarConfiguracionApartamento } from '../../../logica/repositorio/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../logica/repositorio/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { eliminarApartamentoComoEntidad } from '../../../logica/repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { insertarApartamentoComoEntidad } from '../../../logica/repositorio/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { insertarCalendarioSincronizado } from '../../../logica/repositorio/calendario/insertarCalendarioSincronizado.mjs';
import { actualizarEventosCalendarioPorCalendarioUID } from '../../../logica/repositorio/calendario/actualizarEventosCalendarioPorCalendarioUID.mjs';
import { actualizarCalendarioSincronizado } from '../../../logica/repositorio/calendario/actualizarCalendarioSincronizado.mjs';
import { obtenerCalendarioPorCalendarioUIDPublico } from '../../../logica/repositorio/calendario/obtenerCalendarioPorCalendarioUIDPublico.mjs';
import { obtenerCalendariosPorPlataformaIDV } from '../../../logica/repositorio/calendario/obtenerCalendariosPorPlataformaIDV.mjs';
import { obtenerCalendariosPorPlataformaIDVPorCalendarioUID } from '../../../logica/repositorio/calendario/obtenerCalendariosPorPlataformaIDVPorCalendarioUID.mjs';
import { eliminarCalendarioSincronizadoPorTestingIV } from '../../../logica/repositorio/calendario/eliminarCalendarioSincronizadoPorTestingIV.mjs';
import { eliminarCalendarioSincronizadoPorCalendarioUID } from '../../../logica/repositorio/calendario/eliminarCalendarioSincronizadoPorCalendarioUID.mjs';
import { obtenerCalendarioPorCalendarioUID } from '../../../logica/repositorio/calendario/obtenerCalendarioPorCalendarioUID.mjs';
import { eliminarBloqueoPorTestingVI } from '../../../logica/repositorio/bloqueos/eliminarBloqueoPorTestingVI.mjs';

describe('select and update calendars', () => {
    const apartamentoIDVInicial = "apartamento1TESTInicial"
    const testingVI_calendar = "calendarioParaTest"
    const testingVI = "bloqueoTest"
    const nombreCalendario = "calendarioTest"
    const paltaformaOrigen = "plataformaTest"

    let nuevoCalendarioUID = 0
    const nuevoCalendarioUIDPublico = "codigo_calendario_publico"

    beforeAll(async () => {
        await eliminarCalendarioSincronizadoPorTestingIV(testingVI_calendar)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDVInicial)
        await eliminarApartamentoComoEntidad(apartamentoIDVInicial)
        await eliminarBloqueoPorTestingVI(testingVI)


        await insertarApartamentoComoEntidad({
            apartamentoIDV: apartamentoIDVInicial,
            apartamentoUI: "apartamento como entidad para test de calendarios",
        })
        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoIDVInicial,
            estadoInicial: "nodisponible",
            zonaIDV: "global"
        })

    })
    test('insert new apartmen lock', async () => {
        const response = await insertarCalendarioSincronizado({
            nombre: nombreCalendario,
            url: "urlTest",
            apartamentoIDV: apartamentoIDVInicial,
            plataformaOrigen: paltaformaOrigen,
            calendarioRaw: null,
            codigoAleatorioUnico: nuevoCalendarioUIDPublico,
            testingVI: testingVI_calendar,
        })
        nuevoCalendarioUID = response.calendarioUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('update events in calendar', async () => {
        const response = await actualizarEventosCalendarioPorCalendarioUID({
            calendarioUID: nuevoCalendarioUID,
            calendarioRaw: "eventosActualizados",
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('update all details of calendar', async () => {
        const response = await actualizarCalendarioSincronizado({
            nombre: "nombre del calendario actualziado",
            url: "url actualizada",
            apartamentoIDV: apartamentoIDVInicial,
            calendarioRaw: "dataRaw",
            calendarioUID: nuevoCalendarioUID
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec calendar by UIDPublico', async () => {
        const response = await obtenerCalendarioPorCalendarioUIDPublico({
            publicoUID: nuevoCalendarioUIDPublico,
            errorSi: "noExiste"
        });
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    test('selec select calendar by calendarioUID', async () => {
        const response = await obtenerCalendarioPorCalendarioUID(nuevoCalendarioUID);
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })
    test('selec calendars by plataformaIDV', async () => {
        const response = await obtenerCalendariosPorPlataformaIDV(paltaformaOrigen);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })



    test('selec calendar by calendarioUID and platafofrormaIDV', async () => {
        const response = await obtenerCalendariosPorPlataformaIDVPorCalendarioUID({
            calendarioUID: nuevoCalendarioUID,
            plataformaDeOrigen: paltaformaOrigen
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })


    test("delete calendar by calendarioUID", async () => {
        const response = await eliminarCalendarioSincronizadoPorCalendarioUID(nuevoCalendarioUID);
        expect(response).not.toBeUndefined();
        expect(Array.isArray(response)).toBe(true);
    })

    afterAll(async () => {
        await eliminarBloqueoPorTestingVI(testingVI)
        await eliminarApartamentoComoEntidad(apartamentoIDVInicial)
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDVInicial)
        await eliminarCalendarioSincronizadoPorTestingIV(testingVI_calendar)
        await eliminarCalendarioSincronizadoPorCalendarioUID(nuevoCalendarioUID);

    });
})
