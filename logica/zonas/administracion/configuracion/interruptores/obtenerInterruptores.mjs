import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const obtenerInterruptores = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const consultaConfiguracionGlobal = `
                                SELECT 
                                    estado,
                                    "interruptorIDV"
                                FROM 
                                    "interruptoresGlobales";
                               `;
        const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal);
        if (resuelveConfiguracionGlobal.rowCount === 0) {
            const error = "No hay configuraciones globales con estos parametros";
            throw new Error(error);
        }
        const configuraciones = resuelveConfiguracionGlobal.rows;
        const ok = { ok: {} };
        for (const parConfiguracion of configuraciones) {
            const interruptorIDV = parConfiguracion.interruptorIDV;
            const estado = parConfiguracion.estado || "";
            ok.ok[interruptorIDV] = estado;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}