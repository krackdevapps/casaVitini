import { conexion } from "../../../componentes/db.mjs"

export const eliminarChecksPasadosPorNuevasFechasReserva = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida

        const consulta =   `
        UPDATE
        "reservaPernoctantes"
        SET
        "fechaCheckIn" = null,
        "fechaCheckOutAdelantado" = null
        WHERE
        "reservaUID" = $1
        AND
        (
        "fechaCheckIn" < $2
        OR
        "fechaCheckIn" >= $3
        );
        `;
        const parametros = [
            reservaUID,
            fechaEntrada,
            fechaSalida
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

