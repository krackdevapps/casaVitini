import { obtenerParametroConfiguracion } from "../../../shared/configuracion/obtenerParametroConfiguracion.mjs"

export const telefonoPublicoWhatsApp = async () => {
    try {
        const dadaObtenerPares = [
            "telefonoPublicoWhatsApp"
        ]
        const paresConfiguracion = await obtenerParametroConfiguracion(dadaObtenerPares)
        const ok = {
            ok: paresConfiguracion
        }
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }
}