import { conexion } from "../globales/db.mjs";
export const obtenerServicioPorCriterioPublico = async (data) => {
    try {
        const zonaIDVArray = data.zonaIDVArray
        const estadoIDV = data.estadoIDV
        const consulta = `
        SELECT 
        *
        FROM 
        servicios 
        WHERE 
        "estadoIDV" = $1
        AND
        "zonaIDV" = ANY($2)`;
        const parametros = [
            estadoIDV,
            zonaIDVArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
