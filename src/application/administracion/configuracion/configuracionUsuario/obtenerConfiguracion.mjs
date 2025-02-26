import Joi from "joi";
import { obtenerParConfiguracionUsuario } from "../../../../infraestructure/repository/configuracion/configuracionUsuario/obtenerParConfiguracionUsuario.mjs";
import { controlEstructuraPorJoi } from "../../../../shared/validadores/controlEstructuraPorJoi.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

export const obtenerConfiguracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const usuario = entrada.session.usuario
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const esquema = Joi.object({
            paresConfIDV: Joi.array().items(
                Joi.string().custom((value, helpers) => {
                    try {
                            return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El identificador de paresConfIDV",
                            filtro: "rutaArbol",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })).min(1).messages(commonMessages).required(),
        }).required().messages(commonMessages)

        controlEstructuraPorJoi({
            schema: esquema,
            objeto: entrada.body
        })
        const paresConfIDV = entrada.body.paresConfIDV
        
        const paresConfiguracion = await obtenerParConfiguracionUsuario({
            paresConfIDV,
            usuario
        })


        
        const ok = {
            ok: "Configuraciones encontradas del usuarios" ,
            paresConfiguracion
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}