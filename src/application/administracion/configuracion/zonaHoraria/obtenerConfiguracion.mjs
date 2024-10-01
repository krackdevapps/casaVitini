import { listaZonasHorarias } from "../../../../shared/zonasHorarias.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";

import { obtenerParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const paresConf = ["zonaHoraria"]
        const paresConfiguracion = await obtenerParConfiguracion(paresConf)
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