import { conexion } from "../../componentes/db.mjs";
export const obtenerDetallesPorCama = async (camaIDV) => {
    try {
        const consulta = `
        SELECT
        capacidad,
        "camaUI", 
        cama
        FROM camas
        WHERE cama = $1;
        `;
        const resuelve = await conexion.query(consulta, [camaIDV])
        return resuelve.rows
    } catch (errorAdaptador) { 
        throw errorAdaptador
    }

}