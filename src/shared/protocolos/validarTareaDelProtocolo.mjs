import Joi from "joi"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
export const validarTareaDelProtocolo = (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados
        const o = data.o
        const filtrosIDV = data.filtrosIDV
        let numeroFiltros = 0

        let schema = Joi.object({
        }).required().messages(commonMessages)

        if (filtrosIDV.includes("uid")) {
            numeroFiltros++
            schema = schema.keys({
                uid: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de uid",
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
                }).required()
            });
        }
        if (filtrosIDV.includes("posicion")) {
            numeroFiltros++
            schema = schema.keys({
                posicion: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de posicion",
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
        if (filtrosIDV.includes("tareaUI")) {
            numeroFiltros++
            schema = schema.keys({
                tareaUI: Joi.string().required()
            });
        }
        if (filtrosIDV.includes("apartamentoIDV")) {
            numeroFiltros++
            schema = schema.keys({
                apartamentoIDV: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El apartamentoIDV",
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }),
            });
        }
        if (filtrosIDV.includes("tipoDiasIDV")) {
            numeroFiltros++
            schema = schema.keys({
                tipoDiasIDV: Joi.array().items(
                    Joi.string().required().custom((value, helpers) => {
                        try {
                            return validadoresCompartidos.tipos.cadena({
                                string: value,
                                nombreCampo: "El tipoDiasIDV",
                                filtro: "strictoIDV",
                                sePermiteVacio: "no",
                                limpiezaEspaciosAlrededor: "si",
                            })
                        } catch (error) {
                            const path = helpers.state.path.join('.');
                            const mensajeError = `Error en ${path}: ${error.message}`;
                            return helpers.message(mensajeError);
                        }
                    }),
                ).min(1)
            });
        }
        if (numeroFiltros !== filtrosIDV.length) {
            throw new Error("validarElemento mas configurado, hay filtros que no se reconocen")
        }

        const oVal = controlEstructuraPorJoi({
            schema: schema,
            objeto: o
        })

        if (filtrosIDV.includes("tipoDiasIDV")) {
            const tipoDiasIDV = oVal.tipoDiasIDV

            const tiposDiasVal = [
                "siempre",
                "diaEntrada",
                "diaSalida",
                "diaSinReserva",
                "diaDuranteReserva"
            ]
            const controlTipoDiasIDV = tipoDiasIDV.every(tD => tiposDiasVal.includes(tD));
            if (!controlTipoDiasIDV) {
                throw new Error("No se reconoce el identificador de tipoDiasIDV")
            }

            if (tipoDiasIDV.includes("siempre")) {
                oVal.tipoDiasIDV = ["siempre"]
            }
        }
        return oVal
    } catch (error) {
        throw error
    }

}