import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";

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
        const paresConfiguracion = await obtenerParametroConfiguracion(dadaObtenerPares)
        paresConfiguracion.mensajePrincipalEnReservaConfirmada = Buffer.from(paresConfiguracion.mensajePrincipalEnReservaConfirmada, "base64").toString()
        const ok = {
            ok: paresConfiguracion
        }
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }

}