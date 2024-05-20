import { conexion } from "../../componentes/db.mjs";

export const obtenerCalendariosPorPlataformaIDVPorCalendarioUID = async (data) => {
    try {
        const calendarioUID = data.calendarioUID
        const plataformaDeOrigen = data.plataformaDeOrigen

        const consulta = `
        SELECT 
        *
        FROM 
        "calendariosSincronizados" 
        WHERE 
        "calendarioUID" = $1
        AND
        "plataformaOrigen" = $2`
        const parametros = [
            calendarioUID,
            plataformaDeOrigen
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}