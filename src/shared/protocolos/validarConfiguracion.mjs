import Joi from "joi"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
export const validarConfiguracion = (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const o = data.o
        const filtrosIDV = data.filtrosIDV
        let numeroFiltros = 0


        let schema = Joi.object({
        }).required().messages(commonMessages)

        if (filtrosIDV.includes("diasCaducidadRevision")) {
            numeroFiltros++
            schema = schema.append({
                diasCaducidadRevision: Joi.string().optional().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de diasCaducidadRevision",
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                            devuelveUnTipoNumber: "no",
                            devuelveUnTipoBigInt: "no"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }),
            });
        }
        if (filtrosIDV.includes("diasAntelacionPorReserva")) {
            numeroFiltros++
            schema = schema.append({
                diasAntelacionPorReserva: Joi.string().optional().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de diasAntelacionPorReserva",
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                            devuelveUnTipoNumber: "no",
                            devuelveUnTipoBigInt: "no"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }),
            });
        }


        if (numeroFiltros !== filtrosIDV.length) {
            throw new Error("validarConfiguracion mas configurado, hay filtros que no se reconocen")

        }

        const oVal = controlEstructuraPorJoi({
            schema: schema,
            objeto: o
        })

        return oVal
    } catch (error) {
        throw error
    }

}