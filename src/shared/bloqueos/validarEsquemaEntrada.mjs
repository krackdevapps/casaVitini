import Joi from "joi"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"

export const valdiarEsquemaEntrada = (data) => {
    try {
        const schema = Joi.object({
            bloqueoUID: Joi.string().optional().messages({
                'string.base': '{{#label}} debe ser una cadena'
            }),
            apartamentoIDV: Joi.string().allow('').messages({
                'string.base': '{{#label}} debe ser una cadena'
            }),
            tipoBloqueoIDV: Joi.string().allow('').messages({
                'string.base': '{{#label}} debe ser una cadena'
            }),
            zonaIDV: Joi.string().allow('').messages({
                'string.base': '{{#label}} debe ser una cadena'
            }),
            motivo: Joi.string().allow('').messages({
                'string.base': '{{#label}} debe ser una cadena'
            }),
            fechaInicio: Joi.date().optional().messages({
                'date.base': '{{#label}} debe ser una fecha en formato iso'
            }),
            fechaFin: Joi.date().optional().messages({
                'date.base': '{{#label}} debe ser una fecha en formato iso'
            }),
        }).required().messages({
            'any.required': '{{#label}} es una llave obligatoria'
        })
        controlEstructuraPorJoi({
            schema: schema,
            objeto: data
        })
    } catch (error) {
        throw error
    }
}