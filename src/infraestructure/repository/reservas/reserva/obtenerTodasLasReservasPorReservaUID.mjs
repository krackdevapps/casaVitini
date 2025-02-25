import { conexion } from "../../globales/db.mjs"

export const obtenerTodasLasReservasPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        FROM reservas
        WHERE "reservaUID" = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

