import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        to_char("fechaEntrada", 'YYYY-MM-DD') AS "fechaEntrada",
        to_char("fechaSalida", 'YYYY-MM-DD') AS "fechaSalida",
        "estadoReservaIDV",
        "estadoPagoIDV",
        "origenIDV",
        to_char("fechaCreacion", 'YYYY-MM-DD') AS "fechaCreacion",
        to_char("fechaCancelacion", 'YYYY-MM-DD') AS "fechaCancelacion"
        FROM reservas
        WHERE "reservaUID" = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ninguna reserva con el reservaUID que solicitas.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

