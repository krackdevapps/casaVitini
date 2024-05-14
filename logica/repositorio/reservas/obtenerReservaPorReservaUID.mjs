import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        reserva
        to_char("fechaEntrada", 'YYYY-MM-DD'), 
        to_char("fechaSalida", 'YYYY-MM-DD')",
        "estadoReserva", 
        "estadoPago"
        FROM reservas
        WHERE reserva = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ninguna reserva con ese reservaUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

