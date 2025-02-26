import { conexion } from "../../../globales/db.mjs";

export const obtenerPagosPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        *
        FROM 
        "reservaPagos"
        WHERE 
        "reservaUID" = $1`;

        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

