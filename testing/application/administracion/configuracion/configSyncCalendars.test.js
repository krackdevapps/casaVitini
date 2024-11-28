
import { describe, expect, test } from '@jest/globals';
import { crearCalendario } from '../../../../src/application/administracion/configuracion/calendariosSincronizados/airbnb/crearCalendario.mjs';
import { crearEntidadAlojamiento } from '../../../../src/application/administracion/arquitectura/entidades/crearEntidadAlojamiento.mjs';
import { crearConfiguracionAlojamiento } from '../../../../src/application/administracion/arquitectura/configuraciones/crearConfiguracionAlojamiento.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';
import { actualizarCalendario } from '../../../../src/application/administracion/configuracion/calendariosSincronizados/airbnb/actualizarCalendario.mjs';
import { eliminarCalendario } from '../../../../src/application/administracion/configuracion/calendariosSincronizados/airbnb/eliminarCalendario.mjs';
import nock from 'nock';
import { detallesDelCalendario } from '../../../../src/application/administracion/configuracion/calendariosSincronizados/detallesDelCalendario.mjs';
import { obtenerCalendarios } from '../../../../src/application/administracion/configuracion/calendariosSincronizados/obtenerCalendarios.mjs';


describe('Config Sync Calendars', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    let calendarioUID
    const apartamentoIDV = "testingapartmentforcalendar"
    const apartamentoUI = "Apartamento para testing de calendarios"
    const fakeIcal = `BEGIN:VCALENDAR
PRODID;X-RICAL-TZSOURCE=TZINFO:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
CALSCALE:GREGORIAN
VERSION:2.0
BEGIN:VEVENT
DTEND;VALUE=DATE:20240831
DTSTART;VALUE=DATE:20240811
UID:6fec1092d3fa-bc753f0217f0751d65b422397b6988fe@airbnb.com
SUMMARY:Airbnb (Not available)
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20250814
DTSTART;VALUE=DATE:20250510
UID:6fec1092d3fa-8eecd1fecc79617d3626daadf69b1fb1@airbnb.com
SUMMARY:Airbnb (Not available)
END:VEVENT
END:VCALENDAR`

    beforeAll(async () => {
        await eliminarApartamentoComoEntidad(apartamentoIDV)

    })

    test('createEntity ok', async () => {
        const makeEntity = {
            body: {
                tipoEntidad: "apartamento",
                apartamentoUI: apartamentoUI,
                apartamentoIDV: apartamentoIDV,
                apartamentoUIPublico: "Apartamento para testing",
                definicionPublica: "apartamento para testing"
            },
            session: fakeAdminSession
        }
        const response = await crearEntidadAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('create configuration base of hosting with ok', async () => {
        const makeEntity = {
            body: {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            },
            session: fakeAdminSession
        }
        const response = await crearConfiguracionAlojamiento(makeEntity)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('create synced calendar with ok', async () => {
        nock('https://airbnb.com/testing')
            .get('/calendario.ical')
            .reply(200, fakeIcal), {
            'Content-Type': 'text/calendar',
        }
        const newBehavior = {
            body: {
                nombre: "Calendario para testing",
                apartamentoIDV: apartamentoIDV,

            },
            session: fakeAdminSession
        }
        const response = await crearCalendario(newBehavior)
        calendarioUID = response.nuevoUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update synced calendar with ok', async () => {
        nock('https://airbnb.com/testing')
            .get('/calendario.ical')
            .reply(200, fakeIcal), {
            'Content-Type': 'text/calendar',
        }
   
        const response = await actualizarCalendario({
            body: {
                calendarioUID: String(calendarioUID),
                nombre: "Calendario para testing",
                apartamentoIDV: apartamentoIDV,
                url: "https://airbnb.com/testing/calendario.ical"
            },
            session: fakeAdminSession
        })
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get details synced calendar with ok', async () => {
        const newBehavior = {
            body: {
                calendarioUID: String(calendarioUID),
            },
            session: fakeAdminSession
        }
        const response = await detallesDelCalendario(newBehavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all synced calendars with ok', async () => {
        const newBehavior = {
            body: {
                plataformaCalendarios: "airbnb"
            },
            session: fakeAdminSession
        }
        const response = await obtenerCalendarios(newBehavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete synced calendar with ok', async () => {
        const newBehavior = {
            body: {
                calendarioUID: String(calendarioUID),
            },
            session: fakeAdminSession
        }
        const response = await eliminarCalendario(newBehavior)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarApartamentoComoEntidad(apartamentoIDV)
    });
})
