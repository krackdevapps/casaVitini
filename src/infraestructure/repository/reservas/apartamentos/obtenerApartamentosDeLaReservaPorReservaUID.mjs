import { conexion } from "../../globales/db.mjs"

export const obtenerApartamentosDeLaReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM "reservaApartamentos"
        WHERE "reservaUID" = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

