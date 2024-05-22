import { conexion } from "../../../componentes/db.mjs"

export const actualizarEstadoPagoPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        UPDATE reservas
        SET "estadoPagoIDV" = $1
        WHERE "reservaUID" = $2;
        `
        const resuelve = await conexion.query(consulta, [reservaUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ninguna reserva con ese reservaUID ";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

