import { conexion } from "../../../componentes/db.mjs";

export const obtenerServiciosPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "simulacionesDePrecioServicios" 
        WHERE 
        "simulacionUID" = $1`;
        const resuelve = await conexion.query(consulta, [simulacionUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
