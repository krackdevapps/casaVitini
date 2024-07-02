import { conexion } from "../../../componentes/db.mjs"

export const actualizarEstadoReservaYFechaCancelacionPorReservaUID = async (data) => {
    try {

        const estadoReserva = data.estadoReserva
        const fechaCancelacion = data.fechaCancelacion
        const reservaUID = data.reservaUID

        const consulta = `          
            UPDATE reservas
            SET 
            "estadoReservaIDV" = $1,
            "fechaCancelacion" = $2
            WHERE
            "reservaUID"  = $3
            RETURNING *;
            `
            ;
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
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

