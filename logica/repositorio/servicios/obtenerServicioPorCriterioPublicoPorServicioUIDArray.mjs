import { conexion } from "../../componentes/db.mjs";
export const obtenerServicioPorCriterioPublicoPorServicioUIDArray = async (data) => {
    try {
        const zonaIDVArray = data.zonaIDVArray
        const serviciosUIDArray = data.serviciosUIDArray
        const estadoIDV = data.estadoIDV
        const consulta = `
        SELECT 
        *
        FROM 
        servicios 
        WHERE 
        "estadoIDV" = $1
        AND
        "zonaIDV" = ANY($2)
        AND
        "servicioUID" = ANY($3)
        `;
        const parametros = [
            estadoIDV,
            zonaIDVArray,
            serviciosUIDArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
