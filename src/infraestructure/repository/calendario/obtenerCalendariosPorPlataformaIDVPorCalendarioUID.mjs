import { conexion } from "../globales/db.mjs";

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
        "plataformaOrigenIDV" = $2`
        const parametros = [
            calendarioUID,
            plataformaDeOrigen
        ]
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe el calendarioUID con ese plataformaOrigen, revisa el nombre identificador"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}