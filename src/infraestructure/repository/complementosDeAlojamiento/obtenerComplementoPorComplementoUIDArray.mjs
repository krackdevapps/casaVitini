import { conexion } from "../globales/db.mjs";
export const obtenerComplementoPorComplementoUIDArray = async (data) => {
    try {
        const complementoUIDArray = data.complementoUIDArray
        const estadoIDV = data.estadoIDV
        const consulta = `
        SELECT 
        *
        FROM 
        "complementosDeAlojamiento" 
        WHERE 
        "estadoIDV" = $1
        AND
        "complementoUID" = ANY($2)
        `;
        const parametros = [
            estadoIDV,
            complementoUIDArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
