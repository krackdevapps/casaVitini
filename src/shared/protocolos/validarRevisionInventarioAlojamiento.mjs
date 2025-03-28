import Joi from "joi"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
export const validarRevisionInventarioAlojamiento = (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const o = data.o
        const filtrosIDV = data.filtrosIDV
        let numeroFiltros = 0


        let schema = Joi.object({
        }).required().messages(commonMessages)


        if (filtrosIDV.includes("respuestas")) {
            numeroFiltros++
            schema = schema.append({
                respuestas: Joi.array().items(
                    Joi.object({
                        cantidadEncontrada: Joi.string().required().custom((value, helpers) => {
                            try {
                                return validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El campo cantidadEncontrada",
                                    filtro: "cadenaConNumerosEnteros",
                                    sePermiteVacio: "no",
                                    impedirCero: "no",
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
                        color: Joi.string().required().custom((value, helpers) => {
                            try {
                                const c = validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El campo posicion",
                                    filtro: "strictoIDV",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si"
                                })

                                const colores = [
                                    "rojo",
                                    "verde"
                                ]
                                if (!colores.includes(c)) {
                                    throw new Error("Solo se espera color verde o rojo")

                                }
                                return c
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }
                        }),
                        uid: Joi.string().required().custom((value, helpers) => {
                            try {
                                return validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El campo de uid de la respuesta",
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
                    })

                ).required()

            });
        }

        if (filtrosIDV.includes("uid")) {
            numeroFiltros++
            schema = schema.append({

                uid: Joi.string().optional().custom((value, helpers) => {
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
                }),
            });
        }

        if (numeroFiltros !== filtrosIDV.length) {
            throw new Error("validarElemento mas configurado, hay filtros que no se reconocen")

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