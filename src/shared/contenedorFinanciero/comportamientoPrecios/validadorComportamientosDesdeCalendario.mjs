import Joi from "joi"
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { controlEstructuraPorJoi } from "../../validadores/controlEstructuraPorJoi.mjs"

export const validadorComportamientosDesdeCalendario = async (data) => {
    try {

        const entrada = data.entrada
        const conf = data.conf
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados
        const sinApartamentosMessage = {
            'array.includesRequiredUnknowns': '{{#label}} debe contener al menos 1 valor requerido111'
        }

        const schema = Joi.object({
            fechasSel: Joi.array().items(
                Joi.date().iso().required()
            ).min(1).required().messages(commonMessages),
            apartamentosIDVSel: Joi.array().items(
                Joi.string().required().messages(commonMessages)
            ).min(1).required().messages(commonMessages),
            simboloIDV: Joi.string().messages(commonMessages),
            cantidad: Joi.string().messages(commonMessages)
        }).required().messages(commonMessages)

        controlEstructuraPorJoi({
            schema: schema,
            objeto: entrada.body
        })


        const fechasSel = entrada.body.fechasSel
        const controlUnicidadFechas = {}

        for (const f of fechasSel) {
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: f,
                nombreCampo: "La fecha"
            })
            if (controlUnicidadFechas.hasOwnProperty(f)) {
                const m = `La fecha ${f} esta repetida`
                throw new Error(m)
            }
            controlUnicidadFechas[f] = true
        }
        const apartamentosIDVSel = entrada.body.apartamentosIDVSel
        const controlUnicidadApartamentosiDV = {}

        for (const apartamentoIDV of apartamentosIDVSel) {
            validadoresCompartidos.tipos.cadena({
                string: apartamentoIDV,
                nombreCampo: "El apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            if (controlUnicidadApartamentosiDV.hasOwnProperty(apartamentoIDV)) {
                const m = `El identificador visual IDV ${apartamentoIDV} esta repetido`
                throw new Error(m)
            }
            controlUnicidadApartamentosiDV[apartamentoIDV] = true

            await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
        }


        if (conf === "todo") {

            const simboloIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.simboloIDV,
                nombreCampo: "El simboloIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            if (
                simboloIDV !== "aumentoPorcentaje" &&
                simboloIDV !== "aumentoCantidad" &&
                simboloIDV !== "reducirCantidad" &&
                simboloIDV !== "reducirPorcentaje" &&
                simboloIDV !== "precioEstablecido"
            ) {
                const error = `El campo símbolo solo admite aumentoPorcentaje, aumentoCantidad, reducirCantidad, reducirPorcentaje y precioEstablecido`;
                throw new Error(error);
            }
            const cantidad = validadoresCompartidos.tipos.cadena({
                string: entrada.body.cantidad,
                nombreCampo: "El campo cantidad",
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })
        }



    } catch (error) {
        throw error
    }
}