import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

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