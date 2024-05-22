import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { obtenerCalendarios as oc } from "../calendariosSincronizados/obtenerCalendarios.mjs";


export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const configuraciones = await oc([
            "horaEntradaTZ",
            "horaSalidaTZ",
        ])
        const ok = { ok: configuraciones };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}