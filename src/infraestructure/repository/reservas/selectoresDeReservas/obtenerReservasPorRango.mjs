import { conexion } from "../../globales/db.mjs"

export const obtenerReservasPorRango = async (metadatos) => {
    try {

        const fechaIncioRango_ISO = metadatos.fechaIncioRango_ISO
        const fechaFinRango_ISO = metadatos.fechaFinRango_ISO
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
        (
            (
                -- Caso 1: Evento totalmente dentro del rango
                "fechaEntrada" >= $1::DATE AND "fechaSalida" <= $2::DATE
            )
            OR
            (
                -- Caso 2: Evento parcialmente dentro del rango
                ("fechaEntrada" < $1::DATE AND "fechaSalida" > $1::DATE)
                OR ("fechaEntrada" < $2::DATE AND "fechaSalida" > $2::DATE)
            )
            OR
            (
                -- Caso 3: Evento atraviesa el rango
                "fechaEntrada" < $1::DATE AND "fechaSalida" > $2::DATE
            )
        )
        AND "estadoReservaIDV" = ANY($3);`
        const parametros = [
            fechaIncioRango_ISO,
            fechaFinRango_ISO,
            estadosReservaIDV
        ]
        const resuelveRreservas = await conexion.query(consultaReservas, parametros)

        return resuelveRreservas.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
