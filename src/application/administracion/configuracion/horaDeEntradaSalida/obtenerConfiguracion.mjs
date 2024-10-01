import { obtenerParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";


export const obtenerConfiguracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
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