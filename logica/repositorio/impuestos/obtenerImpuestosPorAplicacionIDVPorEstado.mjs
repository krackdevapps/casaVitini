import { conexion } from "../../componentes/db.mjs";

export const obtenerImpuestosPorAplicacionIDVPorEstado = async (data) => {
    try {
        const entidad = data.entidad
        const estadoIDV = data.estadoIDV
        const consulta = `
        SELECT 
        *
        FROM impuestos 
        WHERE 
        "entidadIDV" = $1
        AND 
        "estadoIDV" = $2`
        const parametros = [
            entidad,
            estadoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}