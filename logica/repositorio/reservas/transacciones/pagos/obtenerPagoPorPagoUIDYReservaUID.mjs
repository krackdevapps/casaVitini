import { conexion } from "../../../../componentes/db.mjs";

export const obtenerPagoPorPagoUIDYReservaUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pagoUID = data.pagoUID

        const consulta = `
        SELECT
        "pagoUID",
        "plataformaDePagoIDV",
        cantidad,
        "pagoUIDPasarela"
        FROM "reservaPagos"
        WHERE "reservaUID" = $1 AND "pagoUID" = $2`;
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
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

