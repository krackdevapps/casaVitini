import Joi from "joi"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const valdiarEsquemaEntrada = (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const schema = Joi.object({
            bloqueoUID: Joi.string().optional(),
            apartamentoIDV: Joi.string().allow(''),
            tipoBloqueoIDV: Joi.string().allow(''),
            zonaIDV: Joi.string().allow(''),
            motivo: Joi.string().allow(''),
            fechaInicio: Joi.string().optional(),
            fechaFin: Joi.string().optional(),
        }).required().messages(commonMessages)
        controlEstructuraPorJoi({
            schema: schema,
            objeto: data
        })
    } catch (error) {
        throw error
    }
}