import Joi from "joi"
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs"
import { controlEstructuraPorJoi } from "../../validadores/controlEstructuraPorJoi.mjs"
export const validarGrupoOps = (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const o = data.o
        const filtrosIDV = data.filtrosIDV
        let numeroFiltros = 0


        let schema = Joi.object({
        }).required().messages(commonMessages)

        if (filtrosIDV.includes("grupoIDV")) {
            numeroFiltros++
            schema = schema.keys({
                grupoIDV: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de grupoIDV",
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
        if (filtrosIDV.includes("usuario")) {
            numeroFiltros++
            schema = schema.keys({
                usuario: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de usuario",
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
        if (filtrosIDV.includes("grupoUI")) {
            numeroFiltros++
            schema = schema.keys({
                grupoUI: Joi.string().required()
            });
        }
        if (filtrosIDV.includes("grupoUID")) {
            numeroFiltros++
            schema = schema.keys({
                grupoUID: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de grupoUID",
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
        if (filtrosIDV.includes("permisoUID")) {
            numeroFiltros++
            schema = schema.keys({
                permisoUID: Joi.string().required().custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de permisoUID",
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
        if (filtrosIDV.includes("permisoIDV")) {
            numeroFiltros++
            schema = schema.keys({
                permisoIDV: Joi.string().required().custom((value, helpers) => {
                    try {
                        const pIDV = validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo de permisoIDV",
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })

                        const permisosIDV = [
                            "noPermitido",
                            "permitido"
                        ]

                        if (!permisosIDV.includes(pIDV)) {
                            throw new Error("No se reconode el permiso, solo se espera noPermitido o permitido")

                        }
                        return pIDV

                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                }),
            });
        }
        if (filtrosIDV.includes("contenedores")) {
            numeroFiltros++
            schema = schema.keys({
                contenedores: Joi.array().required().items(
                    Joi.string().required().min(1)
                )
            })
        }


        if (numeroFiltros !== filtrosIDV.length) {
            throw new Error("validarGrupoOps mas configurado, hay filtros que no se reconocen")

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