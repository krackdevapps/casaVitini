import { conexion } from "../../componentes/db.mjs";

export const obtenerCalendarioPorCalendarioUIDPublico = async (publicoUID) => {
    try {
        const consulta = `
        SELECT *
        FROM "calendariosSincronizados"
        WHERE "publicoUID" = $1
        `;
        const resuelve = await conexion.query(consulta, [publicoUID])
        if (resuelve.rowCount === 0) {
            const error = {
                error: "22 No existe el calendarioUID, revisa el nombre identificador"
            }
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}