import Joi from "joi"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const validarObjeto = async (data) => {
    try {

        const schema = Joi.object({
            complementoUID: Joi.string().optional(),
            apartamentoIDV: Joi.string().required(),
            complementoUI: Joi.string().required(),
            definicion: Joi.string().allow(''),
            tipoPrecio: Joi.string().required(),
            precio: Joi.string().required(),
        }).required().messages({
            'any.required': '{{#label}} es una llave obligatoria',
            'string.empty': '{{#label}} no puede estar vacia'
        })

        controlEstructuraPorJoi({
            schema: schema,
            objeto: data
        })


        validadoresCompartidos.tipos.cadena({
            string: data.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: data.complementoUI,
            nombreCampo: "El nombre",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: data.precio,
            nombreCampo: "El campo de precio",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            impedirCero: "no"
        })

        const tiposPrecio = [
            "fijoPorReserva",
            "porNoche"
        ]
        if (!tiposPrecio.includes(data.tipoPrecio)) {
            const m = "El selector de tipoPrecio solo fijoPorReserva o porNoche"
            throw new Error(m)
        }

    } catch (error) {
        throw error
    }
}