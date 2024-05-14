import { listaZonasHorarias } from "../../../../componentes/zonasHorarias.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerParConfiguracion } from "../../../../repositorio/configuracion/obtenerParConfiguracion.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const paresConf = ["zonaHoraria"]
        const paresConfiguracion = await obtenerParConfiguracion(paresConf)
        const ok = {
            ok: paresConfiguracion,
            listaZonasHorarias: listaZonasHorarias
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}