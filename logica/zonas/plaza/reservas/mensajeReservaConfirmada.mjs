import { obtenerParConfiguracion } from "../../../repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs"

export const mensajeReservaConfirmada = async () => {
    try {

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