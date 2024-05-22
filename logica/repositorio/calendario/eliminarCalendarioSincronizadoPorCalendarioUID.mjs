import { conexion } from "../../componentes/db.mjs"

export const eliminarCalendarioSincronizadoPorCalendarioUID = async (calendarioUID) => {
    try {
        const consulta = `
        DELETE FROM "calendariosSincronizados"
        WHERE "calendarioUID" = $1
        RETURNING *;
        `;

        const resuelve = await conexion.query(consulta, [calendarioUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
