import { conexion } from "../../globales/db.mjs";
export const obtenerComplementosAlojamientoPorSimulacionUID = async (simuacionUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "simulacionesDePrecioComplementosAlojamiento" 
        WHERE 
        "simulacionUID" = $1`;
        const resuelve = await conexion.query(consulta, [simuacionUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
