import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { obtenerCalendarios as oc } from "../calendariosSincronizados/obtenerCalendarios.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
         
    c
        const ok = { ok: configuraciones };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}