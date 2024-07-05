import { conexion } from "../../../componentes/db.mjs"

export const actualizarFechaEntradaReserva = async (data) => {
    try {

        const fechaSolicitada_ISO = data.fechaSolicitada_ISO
        const reservaUID = data.reservaUID

        const consulta =  `
        UPDATE reservas
        SET "fechaEntrada" = $1
        WHERE "reservaUID" = $2
        RETURNING
        to_char("fechaEntrada", 'YYYY-MM-DD') AS "fechaEntrada";
        `;
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

