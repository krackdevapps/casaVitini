import { conexion } from "../../../componentes/db.mjs"

export const obtenerCalendarioPorCalendarioUID = async (calendarioUID) => {
    try {
        const consulta = `
            SELECT 
            *
            FROM 
            "calendariosSincronizados" 
            WHERE 
            uid = $1`;
  
        const resuelve = await conexion.query(consulta, [calendarioUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun calendario con este calendarioUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
