import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const consultaConfiguracionGlobal = `
                                SELECT 
                                    valor,
                                    "configuracionUID"
                                FROM 
                                    "configuracionGlobal"
                                WHERE 
                                    "configuracionUID" IN ($1, $2);
                               `;
        const configuracionUID = [
            "horaEntradaTZ",
            "horaSalidaTZ",
        ];
        const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID);
        if (resuelveConfiguracionGlobal.rowCount === 0) {
            const error = "No hay configuraciones globales";
            throw new Error(error);
        }
        const configuraciones = resuelveConfiguracionGlobal.rows;
        const ok = { ok: {} };
        for (const parConfiguracion of configuraciones) {
            const configuracionUID = parConfiguracion.configuracionUID;
            const valor = parConfiguracion.valor;
            ok.ok[configuracionUID] = valor;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}