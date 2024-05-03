import { conexion } from "../../../../componentes/db.mjs";

export const obtenerConfiguracion = async (entrada, salida) => {
    try {
        const consultaConfiguracionGlobal = `
                                SELECT 
                                    valor,
                                    "configuracionUID"
                                FROM 
                                    "configuracionGlobal"
                                WHERE 
                                    "configuracionUID" IN ($1, $2, $3);
                               `;
        const configuracionUID = [
            "diasAntelacionReserva",
            "limiteFuturoReserva",
            "diasMaximosReserva"
        ];
        const resuelveConfiguracionGlobal = await conexion.query(consultaConfiguracionGlobal, configuracionUID);
        if (resuelveConfiguracionGlobal.rowCount === 0) {
            const error = "No hay configuraciones globales con estos parametros";
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