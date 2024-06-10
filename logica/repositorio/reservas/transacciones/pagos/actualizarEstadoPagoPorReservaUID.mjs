import { conexion } from "../../../../componentes/db.mjs";

export const actualizarEstadoPagoPorReservaUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const estadoPagoIDV = data.estadoPagoIDV
        const consulta = `
        UPDATE reservas
        SET "estadoPagoIDV" = $1
        WHERE "reservaUID" = $2;
        `
        const parametros = [
            estadoPagoIDV,
            reservaUID,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ninguna reserva con ese reservaUID ";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

