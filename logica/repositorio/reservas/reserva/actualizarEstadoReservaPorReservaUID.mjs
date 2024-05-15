import { conexion } from "../../../componentes/db.mjs"

export const actualizarEstadoReservaPorReservaUID = async (data) => {
    try {

        const estadoReserva = data.estadoReserva
        const fechaCancelacion = data.fechaCancelacion
        const reservaUID = data.reservaUID

        const consulta = `
            SELECT
            *
            FROM "reservaTotales"
            WHERE 
            reserva = $1;`;
        const parametros = [
            estadoReserva,
            fechaCancelacion,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra la reserva con ese reservaUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

