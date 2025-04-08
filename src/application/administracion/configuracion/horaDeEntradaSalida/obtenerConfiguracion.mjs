import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";



export const obtenerConfiguracion = async (entrada) => {
    try {

        const paresConf = ["horaEntradaTZ", "horaSalidaTZ"]

        const paresConfiguracion = await obtenerParametroConfiguracion(paresConf)
        const ok = { ok: paresConfiguracion };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}