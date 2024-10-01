import { conexion } from "../../../globales/db.mjs";

export const obtenerPagosPorReservaUIDConOrdenamiento = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        "pagoUID",
        "plataformaDePagoIDV",
        "tarjetaDigitos",
        "pagoUIDPasarela",
        "reservaUID",
        tarjeta,
        cantidad,
        to_char("fechaPago", 'YYYY-MM-DD"T"HH24:MI:SS.MS') as "fechaPago",
        "pagadorNombre",
        "pagadorPasaporte",
        "chequeUID",
        "transferenciaUID"
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

