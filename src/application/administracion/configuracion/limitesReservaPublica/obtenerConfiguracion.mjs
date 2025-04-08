import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {


        const dadaObtenerPares = [
            "diasMaximosReserva",
            "diasAntelacionReserva",
            "limiteFuturoReserva",
            "horaLimiteDelMismoDia"
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