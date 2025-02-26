import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";


export const obtenerConfiguracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const paresConf = ["horaEntradaTZ", "horaSalidaTZ"]

        const paresConfiguracion = await obtenerParametroConfiguracion(paresConf)
        const ok = { ok: paresConfiguracion };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}