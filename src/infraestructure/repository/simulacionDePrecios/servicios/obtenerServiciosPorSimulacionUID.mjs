import { conexion } from "../../globales/db.mjs";

export const obtenerServiciosPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "simulacionesDePrecioServicios" 
        WHERE 
        "simulacionUID" = $1
        ORDER BY "servicioUID" ASC`;
        const resuelve = await conexion.query(consulta, [simulacionUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
