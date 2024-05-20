import { conexion } from "../../../componentes/db.mjs"

export const obtenerPagoPorPagoUIDYReservaUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pagoUID = data.pagoUID

        const consulta = `
        SELECT
        "pagoUID",
        "plataformaDePago",
        cantidad,
        "pagoUIDPasarela"
        FROM "reservaPagos"
        WHERE reserva = $1 AND "pagoUID" = $2`;
        const parametros = [
            reservaUID,
            pagoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún pago con ese pagoUID y reservaUID";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

