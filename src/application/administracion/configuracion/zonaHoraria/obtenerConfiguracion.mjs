import { listaZonasHorarias } from "../../../../shared/zonasHorarias.mjs";

import { obtenerParametroConfiguracion } from "../../../../shared/configuracion/obtenerParametroConfiguracion.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {


        const paresConf = ["zonaHoraria"]
        const paresConfiguracion = await obtenerParametroConfiguracion(paresConf)
        const ok = {
            ok: {
                zonaHoraria: paresConfiguracion.zonaHoraria,
                listaZonasHorarias: listaZonasHorarias
            },
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}