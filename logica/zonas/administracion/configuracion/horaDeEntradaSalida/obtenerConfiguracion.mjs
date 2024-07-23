import { obtenerParConfiguracion } from "../../../../repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { obtenerCalendarios as oc } from "../calendariosSincronizados/obtenerCalendarios.mjs";


export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        const paresConf = ["horaEntradaTZ", "horaSalidaTZ"]

        const paresConfiguracion = await obtenerParConfiguracion(paresConf)
        const ok = { ok: paresConfiguracion };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}