import Joi from "joi"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const validarServicio = async (data) => {
    try {
        const servicio = data.servicio
        const numeroLlaves = Object.keys(data)

        const schema = Joi.object({
            nombreServicio: Joi.required(),
            zonaIDV: Joi.string(),
            contenedor: Joi.object({
                fechaInicio: Joi.date(),
                fechaFinal: Joi.date(),
                disponibilidadIDV: Joi.string(),
                tituloPublico: Joi.string(),
                precio: Joi.string(),
                definicion: Joi.string(),
                duracionIDV: Joi.string()
            }).required().messages({
                'object.base': '{{#label}} debe ser un array'
            }),
        }).required().messages({
            'any.required': '{{#label}} es una llave obligatoria'
        })

        controlEstructuraPorJoi({
            schema: schema,
            objeto: servicio
        })



        if (numeroLlaves.length > 3) {
            const m = "Se esperaban no mas de 3 llaves en el primer nivel del objeto"
            throw new Error(m)
        }
        validadoresCompartidos.tipos.cadena({
            string: servicio.nombreServicio,
            nombreCampo: "El nombreServicio",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: servicio?.zonaIDV,
            nombreCampo: "El campo de zonaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const zonas = [
            "publica",
            "privada",
            "global"
        ]
        if (!zonas.includes(servicio.zonaIDV)) {
            const m = "El selector de zonaIDV solo espera publica, privada, global"
            throw new Error(m)
        }

        const contenedor = validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: servicio?.contenedor,
            nombreCampo: "El contenedor",
        })
        let llavesValidadas = 6

        const duracionIDV = contenedor.duracionIDV

        const duraciones = [
            "permanente",
            "rango"
        ]

        if (typeof duracionIDV !== "string" || !duraciones.includes(duracionIDV)) {
            const m = "El campo duracionIDV solo espera permanente o rango"
            throw new Error(m)
        }

        if (duracionIDV === "rango") {
            const fechaInicio = contenedor.fechaInicio
            const fechaFinal = contenedor.fechaFinal

            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaInicio,
                nombreCampo: "La fecha de inico del servicio"
            })
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaFinal,
                nombreCampo: "La fecha de final del servicio"
            })

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio,
                fechaSalida: fechaFinal,
                tipoVector: "diferente"
            })

            llavesValidadas = llavesValidadas + 2
        } else if (duracionIDV === "permanente") {
            delete contenedor.fechaInicio
            delete contenedor.fechaFinal

        }

        const disponibilidadIDV = contenedor.disponibilidadIDV
        const disponibilidades = [
            "constante",
            "variable"
        ]
        if (typeof disponibilidadIDV !== "string" || !disponibilidades.includes(disponibilidadIDV)) {
            const m = "El campo disponibilidadIDV solo espera constante o variable"
            throw new Error(m)
        }

        validadoresCompartidos.tipos.cadena({
            string: contenedor.disponibilidadIDV,
            nombreCampo: "El tituloPublico",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: contenedor.definicion,
            nombreCampo: "El definicion",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: contenedor.precio,
            nombreCampo: "El campo del precio",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            impedirCero: "si",
            devuelveUnTipoNumber: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (Object.keys(contenedor).length > llavesValidadas) {
            const m = `Se esperaban no mas de ${llavesValidadas} llaves en el primer nivel del objeto`
            throw new Error(m)
        }

    } catch (error) {
        throw error
    }
}