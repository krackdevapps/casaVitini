import { conexion } from "../../globales/db.mjs";
export const obtenerTitularPoolReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "poolTitularesReserva"
        WHERE 
        "reservaUID" = $1;`;

        const resuelve = await conexion.query(consulta, [reservaUID])
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
