import { obtenerParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const dadaObtenerPares = [
            "diasMaximosReserva",
            "diasAntelacionReserva",
            "limiteFuturoReserva",
            "horaLimiteDelMismoDia"
        ]
        const paresConfiguracion = await obtenerParConfiguracion(dadaObtenerPares)
        const ok = {
            ok: paresConfiguracion
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}