import Joi from "joi";
import { controlEstructuraPorJoi } from "../../../../shared/validadores/controlEstructuraPorJoi.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { actualizarConfiguracionUsuario } from "../../../../infraestructure/repository/configuracion/configuracionUsuario/actualizarConfiguracionUsuario.mjs";
import { utilidades } from "../../../../shared/utilidades.mjs";
import { insertarConfiguracionUsuario } from "../../../../infraestructure/repository/configuracion/configuracionUsuario/insertarConfiguracionUsuario.mjs";

export const actualizarConfiguracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const usuario = entrada.session.usuario
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const esquema = Joi.object({
            configuracionIDV: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El identificador de configuracionIDV",
                        filtro: "rutaArbol",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })

                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).required().messages(commonMessages),
            valor: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El identificador de valor",
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
        }).required().messages(commonMessages)

        controlEstructuraPorJoi({
            schema: esquema,
            objeto: entrada.body
        })
        const configuracionIDV = entrada.body.configuracionIDV
        const valor = entrada.body.valor

        const diccionarioConfiguracionesIDV = validadoresCompartidos.diccionarios.configuracionesUsuario.arbol

        const controlIDV = utilidades.validarRutaObjeto({
            objetoParaValidar: diccionarioConfiguracionesIDV,
            ruta: configuracionIDV
        })
        if (!controlIDV?.estado) {
            const m = "No se espera la ruta que define configuracionIDV."
            throw new Error(m)
        }
       
        if (!controlIDV?.contenedor.includes(valor)) {
            const m = "Los valores esperados son porDiasIndividual o porRango"
            throw new Error(m)
        }
        
        const configuracionActualizada = await actualizarConfiguracionUsuario({
            usuario,
            configuracionIDV: configuracionIDV,
            valor: valor
        })

        if (!configuracionActualizada?.configuracionUID) {
            const configuracionCrerada = await insertarConfiguracionUsuario({
                usuario,
                configuracionIDV: configuracionIDV,
                valor: valor
            })
            return {
                ok: "Se ha creado la configuración",
                configuracionCrerada
            }
        } else {
            return {
                ok: "Se ha actualizado la configuración",
                configuracionActualizada
            }
        }


    } catch (errorCapturado) {
        throw errorCapturado
    }
}