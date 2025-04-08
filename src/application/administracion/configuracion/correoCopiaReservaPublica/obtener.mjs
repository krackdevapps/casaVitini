import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";


export const obtener = async (entrada) => {
    try {



        const dadaObtenerPares = [
            "correoCopiaReservaPublica"
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