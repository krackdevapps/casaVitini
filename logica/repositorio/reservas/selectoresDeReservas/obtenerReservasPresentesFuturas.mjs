import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservasPresentesFuturas = async (metadatos) => {
    try {
        const fechaActual = metadatos.fechaActual
        const estadosReservaIDV = ["pendiente", "confirmada"]
        const consultaReservas = `
        SELECT 
        "reservaUID",
        to_char("fechaEntrada", 'YYYY-MM-DD') AS "fechaEntrada",
        to_char("fechaSalida", 'YYYY-MM-DD') AS "fechaSalida",
        "estadoReservaIDV",
        "estadoPagoIDV",
        "origenIDV",
        to_char("fechaCreacion", 'YYYY-MM-DD') AS "fechaCreacion",
        to_char("fechaCancelacion", 'YYYY-MM-DD') AS "fechaCancelacion"
        FROM
        reservas  
        WHERE
        "fechaSalida" >= $1
        AND 
        "estadoReservaIDV" = ANY($2);`
        const parametros = [
            fechaActual,
            estadosReservaIDV
        ]
        const resuelveRreservas = await conexion.query(consultaReservas, parametros)
        return resuelveRreservas.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
