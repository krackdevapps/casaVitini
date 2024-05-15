import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        "reservaUID",
        to_char("fechaEntrada", 'YYYY-MM-DD'), 
        to_char("fechaSalida", 'YYYY-MM-DD'),
        "estadoReservaIDV", 
        "estadoPagoIDV",
        "origenIDV",
        to_char("fechaCreacion", 'YYYY-MM-DD'),
        to_char("fechaCancelacion", 'YYYY-MM-DD')
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

