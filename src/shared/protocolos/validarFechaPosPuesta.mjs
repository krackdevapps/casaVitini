import Joi from "joi"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
export const validarFechaPosPuesta = async (data) => {
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

        if (filtrosIDV.includes("fechaPosPuesta")) {
            numeroFiltros++
            schema = schema.keys({
                fechaPosPuesta: Joi.string().required()
                //     .custom(async (value, helpers) => {
                //     try {
                //         
                //         const fechaPosPuesta = await validadoresCompartidos.fechas.validarFecha_ISO({
                //             fecha_ISO: value,
                //             nombreCampo: "La fecha pospuestaa"
                //         })



                //         return fechaPosPuesta
                //     } catch (error) {
                //         
                //         const path = helpers.state.path.join('.');
                //         const mensajeError = `Error en ${path}: ${error.message}`;
                //         helpers.message(mensajeError);
                //     }
                // }),
            });


        }

        if (numeroFiltros !== filtrosIDV.length) {
            throw new Error("validarFechaPosPuesta mas configurado, hay filtros que no se reconocen")
        }

        const oVal = controlEstructuraPorJoi({
            schema: schema,
            objeto: o
        })

        if (filtrosIDV.includes("fechaPosPuesta")) {
            const fechaPosPuesta = oVal.fechaPosPuesta
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaPosPuesta,
                nombreCampo: "La fecha pospuestaa"
            })
        }



        return oVal
    } catch (error) {
        throw error
    }

}