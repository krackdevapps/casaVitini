import { conexion } from "../../componentes/db.mjs"
// Este script
export const eliminarCalendarioSincronizadoPorCalendarioIDV = async (calendarioIDV) => {
    try {
        const consulta = `
        DELETE FROM "calendariosSincronizados"
        WHERE "calendarioIDV" = $1
        RETURNING *;
        `;

        const resuelve = await conexion.query(consulta, [calendarioIDV]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
