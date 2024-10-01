
import { describe, expect, test } from '@jest/globals';
import { crearOferta } from '../../../../src/application/administracion/ofertas/crearOferta.mjs';
import { eliminarOfertaPorTestingVI } from '../../../../src/infraestructure/repository/ofertas/eliminarOfertaPorTestingVI.mjs';
import { actualizarOferta } from '../../../../src/application/administracion/ofertas/actualizarOferta.mjs';
import { actualizarEstadoOferta } from '../../../../src/application/administracion/ofertas/actualizarEstadoOferta.mjs';
import { detallesOferta } from '../../../../src/application/administracion/ofertas/detallesOferta.mjs';
import { listasOfertasAdministracion } from '../../../../src/application/administracion/ofertas/listasOfertasAdministracion.mjs';
import { eliminarOferta } from '../../../../src/application/administracion/ofertas/eliminarOferta.mjs';
import { makeHostArquitecture } from '../../../sharedUsesCases/makeHostArquitecture.mjs';

describe('crud offers system', () => {
    const fakeAdminSession = {
        usuario: "test",
        rolIDV: "administrador"
    }
    const testingVI = "offerfortesting"
    const apartamentoIDV = "apartamentfortestingadddiscountstoreserve"
    const apartamentoUI = "Apartamento temporal creado para discounts"
    const habitacionIDV = "temporalroomfortestingadddiscountstoreserve"
    const habitacionUI = "Habitacion temporal para testing discounts"
    const camaIDV = "temporalbedfortestingaddapartamentotoreserve"
    const camaUI = "Cama temporal para testing de discounts"

    const fakeOffer = {
        nombreOferta: "oferta creadad para testing",
        zonaIDV: "global",
        entidadIDV: "reserva",
        fechaInicio: "2026-10-10",
        fechaFinal: "2026-10-20",
        condicionesArray: [
            {
                "tipoCondicion": "conFechaEntradaEntreRango",
                "fechaInicioRango_ISO": "2024-08-14",
                "fechaFinalRango_ISO": "2024-08-16"
            },
            {
                "tipoCondicion": "conFechaCreacionEntreRango"
            },
            {
                "tipoCondicion": "porNumeroDeApartamentos",
                "tipoConteo": "numeroExacto",
                "numeroDeApartamentos": "5"
            },
            {
                "tipoCondicion": "porApartamentosEspecificos",
                "tipoDeEspecificidad": "alguno",
                "apartamentos": [
                    {
                        "apartamentoIDV": apartamentoIDV
                    },


                ]
            },
            {
                "tipoCondicion": "porDiasDeAntelacion",
                "tipoConteo": "aPartirDe",
                "numeroDeDias": "5"
            },
            {
                "tipoCondicion": "porDiasDeReserva",
                "tipoConteo": "aPartirDe",
                "numeroDeDias": "5"
            },
            {
                "tipoCondicion": "porRangoDeFechas",
                "fechaInicioRango_ISO": "2024-08-14",
                "fechaFinalRango_ISO": "2024-08-16"
            },
            {
                "tipoCondicion": "porCodigoDescuento",
                "codigoDescuento": "codigodescuentoejemplo"
            }
        ],
        descuentosJSON: {
            "tipoDescuento": "totalNeto",
            "tipoAplicacion": "porcentaje",
            "descuentoTotal": "10.00"
        }
    }
    let ofertaUID
    beforeAll(async () => {
        process.env.TESTINGVI = testingVI
        // Añadir el eliminar impuesto por testingVI
        await eliminarOfertaPorTestingVI(testingVI)
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

    test('create offer with ok', async () => {
        const m = {
            body: {
                ...fakeOffer
            },
            session: fakeAdminSession
        }
        const response = await crearOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
        ofertaUID = response.oferta.ofertaUID
    })

    test('update offer with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID),
                ...fakeOffer
            },
            session: fakeAdminSession
        }
        const response = await actualizarOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('update status of offer with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID),
                estadoIDV: "activado"
            },
            session: fakeAdminSession
        }
        const response = await actualizarEstadoOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })


    test('get details of offer with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID),
            },
            session: fakeAdminSession
        }
        const response = await detallesOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get details of offer with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID),
            },
            session: fakeAdminSession
        }
        const response = await detallesOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('get all offers with ok', async () => {
        const m = {
            body: {},
            session: fakeAdminSession
        }
        const response = await listasOfertasAdministracion(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    test('delete offer with ok', async () => {
        const m = {
            body: {
                ofertaUID: String(ofertaUID),
            },
            session: fakeAdminSession
        }
        const response = await eliminarOferta(m)
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
        expect(response).toHaveProperty('ok');
    })

    afterAll(async () => {
        await makeHostArquitecture({
            operacion: "eliminar",
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            camaIDV: camaIDV
        })
        await eliminarOfertaPorTestingVI(testingVI)
    });

})
