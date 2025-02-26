import { conexion } from "../../globales/db.mjs"

export const actualizarEstadoReservaPorReservaUID = async (data) => {
    try {
        const nuevoEstado = data.nuevoEstado
        const reservaUID = data.reservaUID
        const consulta = `          
            UPDATE reservas
            SET 
            "estadoReservaIDV" = $1
            WHERE
            "reservaUID" = $2
            RETURNING *;
            `
            ;
        const parametros = [
            nuevoEstado,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra la reserva con ese reservaUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

