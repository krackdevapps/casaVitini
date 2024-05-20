import { conexion } from "../../componentes/db.mjs";

export const obtenerCalendariosPorCalendarioUIDPublico = async (publicoUID) => {
    try {
        const consulta = `
        SELECT *
        FROM "calendariosSincronizados"
        WHERE "publicoUID" = $1
        `;
        const resuelve = await conexion.query(consulta, [publicoUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe el calendarioUID, revisa el nombre identificador"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}