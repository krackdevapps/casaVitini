import { conexion } from "../../componentes/db.mjs";

export const obtenerCalendariosPorCalendarioUID = async (calendarioUID) => {
    try {
        const consulta = `
        SELECT *
        FROM "calendariosSincronizados"
        WHERE "calendarioUID" = $1
        `;
        const resuelve = await conexion.query(consulta, [calendarioUID])
        if (resuelve.rowCount === 0) {
            const error = {
                error: "11 No existe el calendarioUID, revisa el nombre identificador"
            }
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}