import Joi from "joi"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
export const finanzasValidadorCompartido = (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados
        const o = data.o
        const filtrosIDV = data.filtrosIDV
        let numeroFiltros = 0;

        let schema = Joi.object({
        }).required().messages(commonMessages)

        if (filtrosIDV.includes("nombre")) {
            numeroFiltros++
            schema = schema.keys({
                nombre: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de nombre",
                            filtro: "strictoConEspacios",
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

        if (filtrosIDV.includes("plataforma")) {
            numeroFiltros++
            schema = schema.keys({
                plataforma: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de plataforma",
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }),
            });
        }
        if (filtrosIDV.includes("operacionIDV")) {
            numeroFiltros++
            schema = schema.keys({
                operacionIDV: Joi.string().required().custom((value, helpers) => {
                    try {
                        const operacionIDV = validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de operacionIDV",
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                        const operacionesIDV = [
                            "insertarEnInventario",
                            "extraerEnInventario"
                        ]
                        if (!operacionesIDV.includes(operacionIDV)) {
                            throw new Error("El campo operacionIVD solo espera insertarEnInventario o extraerEnInventario")
                        }
                        return operacionIDV
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }),
            });
        }
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
                }),
            });
        }

        if (filtrosIDV.includes("nombre")) {
            numeroFiltros++
            schema = schema.keys({
                nombre: Joi.string().required(),

            });
        }
        if (filtrosIDV.includes("cantidad")) {
            numeroFiltros++

            schema = schema.keys({
                cantidad: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de cantidad",
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
        if (filtrosIDV.includes("tipoLimite")) {
            numeroFiltros++

            schema = schema.keys({
                tipoLimite: Joi.string().required().custom((value, helpers) => {
                    try {
                        const tiposLimite = [
                            "sinLimite",
                            "conLimite"
                        ]
                        if (!tiposLimite.includes(value)) {
                            throw new Error("Por favor seleciaon el tipo de limite mínimo")
                        }
                        return value
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }),
            });
        }
        if (filtrosIDV.includes("cantidadMinima")) {
            numeroFiltros++

            schema = schema.keys({
                cantidadMinima: Joi.required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de cantidad",
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "si",
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
        if (filtrosIDV.includes("descripcion")) {
            numeroFiltros++

            schema = schema.keys({
                descripcion: Joi.string().allow('').required()

            });
        }

        if (numeroFiltros !== filtrosIDV.length) {
            throw new Error("finanzasValidadorCompartido mal configurado, hay filtros que no se reconocen")

        }

        const oVal = controlEstructuraPorJoi({
            schema: schema,
            objeto: o
        })
        const cantidadMinima = oVal.cantidadMinima
        if (!cantidadMinima || cantidadMinima.length === 0) {
            oVal.cantidadMinima = "0"
        }

        return oVal
    } catch (error) {
        throw error
    }

}