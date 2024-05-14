import { conexion } from "../../../componentes/db.mjs"

export const obtenerCalendarioPorCalendarioUIDPublico = async (calendarioUIDPublico) => {
    try {
        const consulta = `
        SELECT
        "uidPublico"
        FROM "calendariosSincronizados"
        WHERE "uidPublico" = $1;`;
  
        const resuelve = await conexion.query(consulta, [calendarioUIDPublico]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun calendario con este calendarioUIDPublico";
            throw new Error(error)
        }
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
