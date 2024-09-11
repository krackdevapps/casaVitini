import { conexion } from "../../../componentes/db.mjs";
export const obtenerDesgloseFinancieroPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        SELECT
            *
        FROM 
            "simulacionesDePrecio"
        WHERE 
            "simulacionUID" = $1;`;
        const resuelve = await conexion.query(consulta, [simulacionUID]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

