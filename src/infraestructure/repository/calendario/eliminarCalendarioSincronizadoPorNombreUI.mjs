import { conexion } from "../globales/db.mjs"

export const eliminarCalendarioSincronizadoPorCalendarioIDV = async (calendarioIDV) => {
    try {
        const consulta = `
        DELETE FROM "calendariosSincronizados"
        WHERE "calendarioIDV" = $1;
        RETURNING
        *
        `;

        const resuelve = await conexion.query(consulta, [calendarioIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha eliminado el calendario sincronizado";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
