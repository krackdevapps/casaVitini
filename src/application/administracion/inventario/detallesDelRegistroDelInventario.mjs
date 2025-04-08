import Joi from "joi";

import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";
import { obtenerRegistroPorUID } from "../../../infraestructure/repository/inventario/obtenerRegistroPorUID.mjs";
import { operacionesRegistro } from "../../../shared/inventario/traductorOperacionIDV.mjs";

export const detallesDelRegistroDelInventario = async (entrada) => {
    try {

        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const esquemaBusqueda = Joi.object({
            registroUID: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El registroUID",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).required()
        }).required().messages(commonMessages)

        const oVal = controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })
        const registroUID = oVal.registroUID
        const detallesDelRegistro = await obtenerRegistroPorUID({
            registroUID,
            errorSi: "noExiste"
        })
        const operacionIDV = detallesDelRegistro.operacionIDV
        const ok = {
            ok: "Detalles del registro encontrado",
            registro: {
                ...detallesDelRegistro,
                ...operacionesRegistro({
                    operacionIDV,
                    funcion: "traducirUI"
                })
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}