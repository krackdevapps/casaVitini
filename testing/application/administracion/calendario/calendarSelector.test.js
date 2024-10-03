
import { describe, expect, test } from '@jest/globals';
import { multiCapa } from '../../../../src/application/administracion/calendario/capas/multiCapa.mjs';
import { insertarCalendarioSincronizado } from '../../../../src/infraestructure/repository/calendario/insertarCalendarioSincronizado.mjs';
import { insertarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs';
import { insertarConfiguracionApartamento } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs';
import { eliminarConfiguracionPorApartamentoIDV } from '../../../../src/infraestructure/repository/arquitectura/configuraciones/eliminarConfiguracionPorApartamentoIDV.mjs';
import { eliminarApartamentoComoEntidad } from '../../../../src/infraestructure/repository/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs';

describe('calendars selectors', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const apartamentoIDV = "apartamentotestingcalendars"
    let calendarioUID
    beforeAll(async () => {

        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDV)
        await eliminarApartamentoComoEntidad(apartamentoIDV)

        await insertarApartamentoComoEntidad({
            apartamentoIDV: apartamentoIDV,
            apartamentoUI: "apartamento como entidad pada test",
        })
        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoIDV,
            estadoInicial: "nodisponible",
            zonaIDV: "global"
        })

        const fakeCalendar = {
            nombre: "Calendario para testing",
            url: "fakeURL",
            apartamentoIDV: apartamentoIDV,
            plataformaOrigen: "airbnb",
            calendarioRaw: `BEGIN:VCALENDAR
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
END:VCALENDAR
                            `,
            codigoAleatorioUnico: "0m6bk58x1urffu7oee047u06bamuxuudosi2q12075bfocrd2g6qz64katul11.ics",
            testingVI: "calendariotestinge"
        }
        const response = await insertarCalendarioSincronizado(fakeCalendar)
        calendarioUID = response.calendarioUID
    })


    test('get calendar by layer porApartamentos with ok', async () => {
        const newLock = {
            body: {
                fecha: "7-2024",
                contenedorCapas: {
                    capas: ["porApartamento"],
                    capasCompuestas: {
                        porApartamento: ["apartamento3", "apartamento5"]
                    }
                }
            },
            session: fakeAdminSession
        }
        const response = await multiCapa(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get calendar by layer reservas with ok', async () => {
        const newLock = {
            body: {
                fecha: "7-2024",
                contenedorCapas: {
                    capas: ["reservas"],
                }
            },
            session: fakeAdminSession
        }
        const response = await multiCapa(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');

    })

    test('get calendar by layer todosLosApartamentos with ok', async () => {
        const newLock = {
            body: {
                fecha: "7-2024",
                contenedorCapas: {
                    capas: ["todosLosApartamentos"],
                }
            },
            session: fakeAdminSession
        }
        const response = await multiCapa(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get calendar by layer todosLosBloqueos with ok', async () => {
        const newLock = {
            body: {
                fecha: "7-2024",
                contenedorCapas: {
                    capas: ["todosLosBloqueos"],
                }
            },
            session: fakeAdminSession
        }
        const response = await multiCapa(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })
    test('get calendar by layer todoAirbnb with ok', async () => {
        const newLock = {
            body: {
                fecha: "7-2024",
                contenedorCapas: {
                    capas: ["todoAirbnb"],
                }
            },
            session: fakeAdminSession
        }
        const response = await multiCapa(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get calendar by layer calendariosAirbnb with ok', async () => {
        const newLock = {
            body: {
                fecha: "7-2024",
                contenedorCapas: {
                    capas: ["calendariosAirbnb"],
                    capasCompuestas: {
                        calendariosAirbnb: [calendarioUID]
                    }
                }
            },
            session: fakeAdminSession
        }
        const response = await multiCapa(newLock)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDV)
        await eliminarApartamentoComoEntidad(apartamentoIDV)

    });
})
