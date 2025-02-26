import { conexion } from "../../globales/db.mjs"

export const insertarReservaAdministrativa = async (data) => {
    try {
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const estadoReserva = data.estadoReserva
        const origen = data.origen
        const fechaCreacion = data.fechaCreacion
        const estadoPago = data.estadoPago
        const reservaUID = data.reservaUID
        const testingVI = data.testingVI
        const consulta = `
        INSERT INTO
        reservas 
        (
        "fechaEntrada",
        "fechaSalida",
        "estadoReservaIDV",
        "origenIDV",
        "fechaCreacion",
        "estadoPagoIDV",
        "reservaUID",
        "testingVI"
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING 
        * `;
        const parametros = [
            fechaEntrada,
            fechaSalida,
            estadoReserva,
            origen,
            fechaCreacion,
            estadoPago,
            reservaUID,
            testingVI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la reserva.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

