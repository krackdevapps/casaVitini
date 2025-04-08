import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";


export const obtenerMensaje = async (entrada) => {
    try {



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