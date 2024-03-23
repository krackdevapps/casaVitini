import { conexion } from "../../db.mjs"
const reservasPorRango = async (metadatos) => {
    try {
        const fechaIncioRango_ISO = metadatos.fechaIncioRango_ISO
        const fechaFinRango_ISO = metadatos.fechaFinRango_ISO
        const consultaReservas = `
        SELECT reserva 
        FROM reservas  
        WHERE                     
        ((
            -- Caso 1: Evento totalmente dentro del rango
            entrada >= $1::DATE AND salida <= $2::DATE
        )
        OR
        (
            -- Caso 2: Evento parcialmente dentro del rango
            (entrada < $1::DATE AND salida > $1::DATE)
            OR (entrada < $2::DATE AND salida > $2::DATE)
        )
        OR
        (
            -- Caso 3: Evento atraviesa el rango
            entrada < $1::DATE AND salida > $2::DATE
        ))
        AND "estadoReserva" <> 'cancelada';`
        const resuelveRreservas = await conexion.query(consultaReservas, [fechaIncioRango_ISO, fechaFinRango_ISO])
        return resuelveRreservas.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
export {
    reservasPorRango
}