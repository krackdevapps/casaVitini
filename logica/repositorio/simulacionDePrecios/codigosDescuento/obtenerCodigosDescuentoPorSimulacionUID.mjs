import { conexion } from "../../../componentes/db.mjs";

export const obtenerCodigosDescuentoPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "simulacionesDePrecioCodigosDescuento" 
        WHERE 
        "simulacionUID" = $1`;
        const resuelve = await conexion.query(consulta, [simulacionUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
