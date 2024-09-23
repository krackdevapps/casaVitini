import { obtenerParConfiguracion } from "../../../../repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const obtenerMensaje = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const dadaObtenerPares = [
            "mensajePrincipalEnReservaConfirmada" 
        ]
        const paresConfiguracion = await obtenerParConfiguracion(dadaObtenerPares)       
        paresConfiguracion.mensajePrincipalEnReservaConfirmada = !paresConfiguracion.mensajePrincipalEnReservaConfirmada ? "" :
            paresConfiguracion.mensajePrincipalEnReservaConfirmada
        
            paresConfiguracion.mensajePrincipalEnReservaConfirmada = Buffer.from(paresConfiguracion.mensajePrincipalEnReservaConfirmada, "base64").toString()
        
                const ok = {
            ok: paresConfiguracion
        }
        return ok

  
    } catch (errorCapturado) {
        throw errorCapturado
    }

}