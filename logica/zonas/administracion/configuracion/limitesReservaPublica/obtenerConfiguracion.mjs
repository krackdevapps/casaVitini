import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerParConfiguracion } from "../../../../repositorio/configuracion/obtenerParConfiguracion.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const dadaObtenerPares = [
            "diasMaximosReserva",
            "diasAntelacionReserva",
            "limiteFuturoReserva"
        ]
        const paresConfiguracion = await obtenerParConfiguracion(dadaObtenerPares)
        const ok = {
            ok: paresConfiguracion
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}