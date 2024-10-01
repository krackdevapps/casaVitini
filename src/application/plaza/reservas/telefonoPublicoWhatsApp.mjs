import { obtenerParConfiguracion } from "../../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs"

export const telefonoPublicoWhatsApp = async () => {
    try {

        const dadaObtenerPares = [
            "telefonoPublicoWhatsApp"
        ]
        const paresConfiguracion = await obtenerParConfiguracion(dadaObtenerPares)
        paresConfiguracion.telefonoPublicoWhatsApp = !paresConfiguracion.telefonoPublicoWhatsApp ? "" :
            paresConfiguracion.telefonoPublicoWhatsApp

        const ok = {
            ok: paresConfiguracion
        }
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }

}