import { conexion } from "../../../componentes/db.mjs"

export const obtenerPagosPorReservaUIDConOrdenamiento = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        *
        FROM 
        "reservaPagos"
        WHERE 
        "reservaUID" = $1  
        ORDER BY
        "pagoUID" DESC;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

