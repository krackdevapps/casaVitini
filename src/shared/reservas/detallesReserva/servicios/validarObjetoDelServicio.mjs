import Joi from "joi";
import { controlEstructuraPorJoi } from "../../../validadores/controlEstructuraPorJoi.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";

export const validarObjetoDelServicio = (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados
        const opcionesSeleccionadasDelServicio = data.opcionesSeleccionadasDelServicio
        const opcionesDelServicioSelecionado = Joi.object({
            servicioUID: Joi
                .string()
                .required()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El identificador universal (servicioUID)",
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                            devuelveUnTipoNumber: "si"
                        })


                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .messages(commonMessages),
            opcionesSeleccionadas: Joi.object().pattern(
                Joi.string()
                    .required()
                    .custom((value, helpers) => {
                        try {
                            return validadoresCompartidos.tipos.cadena({
                                string: value,
                                nombreCampo: "El identificador del grupoIDV",
                                filtro: "strictoIDV",
                                sePermiteVacio: "no",
                                limpiezaEspaciosAlrededor: "si",
                            })
                        } catch (error) {
                            const path = helpers.state.path.join('.');
                            const mensajeError = `Error en ${path}: ${error.message}`;
                            return helpers.message(mensajeError);
                        }
                    }).messages(commonMessages),  // Claves dinámicas que sigan el patrón "grupo0", "grupo1", "grupo2", etc.
                Joi.array().items(
                    Joi.object({
                        opcionIDV: Joi.string().custom((value, helpers) => {
                            try {
                                return validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El identificador de opcionIDV",
                                    filtro: "strictoIDV",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                })
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }
                        }).required().messages(commonMessages),
                        cantidad: Joi.string().custom((value, helpers) => {
                            try {
                                return validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El identificador de opcionIDV",
                                    filtro: "cadenaConNumerosEnteros",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                    sePermitenNegativos: "no",
                                    devuelveUnTipoNumber: "no"

                                })
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }
                        }).messages(commonMessages),
                    }).messages(commonMessages)
                ).required(),// Los valores deben ser arrays de objetos
            ).required().messages(commonMessages),
        })
        // ojo con lo que devuele
        return controlEstructuraPorJoi({
            schema: opcionesDelServicioSelecionado,
            objeto: opcionesSeleccionadasDelServicio
        })
    } catch (error) {
        throw error
    }
}