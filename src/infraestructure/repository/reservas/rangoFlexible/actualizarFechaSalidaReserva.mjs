import { conexion } from "../../globales/db.mjs"

export const actualizarFechaSalidaReserva = async (data) => {
    try {

        const fechaSolicitada_ISO = data.fechaSolicitada_ISO
        const reservaUID = data.reservaUID

        const consulta = `
        UPDATE reservas
        SET "fechaSalida" = $1
        WHERE "reservaUID" = $2
        RETURNING
        to_char("fechaSalida", 'YYYY-MM-DD') AS "fechaSalida";`;
        const parametros = [
            fechaSolicitada_ISO,
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

