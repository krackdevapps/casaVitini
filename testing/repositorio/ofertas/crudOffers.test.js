
import { describe, expect, test } from '@jest/globals';
import { insertarOferta } from '../../../logica/repositorio/ofertas/insertarOferta.mjs';
import { eliminarOfertaPorTestingVI } from '../../../logica/repositorio/ofertas/eliminarOfertaPorTestingVI.mjs';

const contenedoOferta = {
    "nombreOferta": "testing_all_conditions",
    "zonaIDV": "global",
    "entidadIDV": "reserva",
    "fechaInicio": "2024-08-07",
    "fechaFinal": "2024-08-09",
    "condicionesArray": [
        {
            "tipoCondicion": "conFechaEntradaEntreRango",
            "fechaInicioRango_ISO": "2024-08-14",
            "fechaFinalRango_ISO": "2024-08-17"
        },
        {
            "tipoCondicion": "conFechaCreacionEntreRango"
        },
        {
            "tipoCondicion": "porNumeroDeApartamentos",
            "tipoConteo": "numeroExacto",
            "numeroDeApartamentos": "6"
        },
        {
            "tipoCondicion": "porApartamentosEspecificos",
            "tipoDeEspecificidad": "alguno",
            "apartamentos": [
                {
                    "apartamentoIDV": "apartamento5"
                },
                {
                    "apartamentoIDV": "apartamento7"
                }
            ]
        },
        {
            "tipoCondicion": "porDiasDeAntelacion",
            "tipoConteo": "numeroExacto",
            "numeroDeDias": "8"
        },
        {
            "tipoCondicion": "porDiasDeReserva",
            "tipoConteo": "hastaUnNumeroExacto",
            "numeroDeDias": "6"
        },
        {
            "tipoCondicion": "porRangoDeFechas",
            "fechaInicioRango_ISO": "2024-08-14",
            "fechaFinalRango_ISO": "2024-08-16"
        },
        {
            "tipoCondicion": "porCodigoDescuento",
            "codigoDescuento": "hola"
        }
    ],
    "descuentosJSON": {
        "tipoDescuento": "totalNeto",
        "tipoAplicacion": "cantidadFija",
        "descuentoTotal": "10.00"
    },
    "zona": "administracion/ofertas/crearOferta"
}

describe('crud ofers', () => {
    const testingVI = "ofertaTest"
    let nuevaOfertaUID
    beforeAll(async () => {
        await eliminarOfertaPorTestingVI(testingVI)

    })
    test('insert offer', async () => {
        const response = await insertarOferta({
            nombreOferta: contenedoOferta.nombreOferta,
            zonaIDV: contenedoOferta.zonaIDV,
            entidadIDV: "reserva",
            fechaInicio: contenedoOferta.fechaInicio,
            fechaFinal: contenedoOferta.fechaFinal,
            condicionesArray: contenedoOferta.condicionesArray,
            descuentosJSON: contenedoOferta.descuentosJSON,
            estado: "desactivado",
            testingVI
        })
        nuevaOfertaUID = response.ofertaUID
        expect(response).not.toBeUndefined();
        expect(typeof response).toBe('object');
    })

    afterAll(async () => {
        await eliminarOfertaPorTestingVI(testingVI)


    });
})
