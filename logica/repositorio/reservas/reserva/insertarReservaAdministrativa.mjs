import { conexion } from "../../../componentes/db.mjs"

export const insertarReservaAdministrativa = async (data) => {
    try {
        const fechaEntrada_ISO = data.fechaEntrada_ISO
        const fechaSalida_ISO = data.fechaSalida_ISO
        const estadoReserva = data.estadoReserva
        const origen = data.origen
        const creacionFechaReserva = data.creacionFechaReserva
        const estadoPago = data.estadoPago

        const consulta = `
        INSERT INTO
        reservas 
        (
        "fechaEntrada",
        "fechaSalida,
        "estadoReservaIDV",
        "origenIDV",
        "fechaCreacion",
        "estadoPagoIDV")
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING 
        "reservaUID" `;
        const parametros = [
            fechaEntrada_ISO,
            fechaSalida_ISO,
            estadoReserva,
            origen,
            creacionFechaReserva,
            estadoPago
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la reserva.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

