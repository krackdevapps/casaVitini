import { conexion } from "../../componentes/db.mjs"
const reservasPorRango_y_apartamentos = async (metadatos) => {
    try {
        const fechaInicioRango_ISO = metadatos.fechaInicioRango_ISO
        const fechaFinRango_ISO = metadatos.fechaFinRango_ISO
        const reservaUID = metadatos.reservaUID
        const apartamentosIDV_array = metadatos.apartamentosIDV_array || []
        const consultaReservas = `
        SELECT 
        r.reserva,        
        to_char(r.entrada, 'YYYY-MM-DD') AS "fechaEntrada_ISO", 
        to_char(r.salida, 'YYYY-MM-DD') AS "fechaSalida_ISO",
        ARRAY_AGG(ra.apartamento) AS apartamentos    
        FROM 
        reservas r
        JOIN 
        "reservaApartamentos" ra ON r.reserva = ra.reserva
        WHERE               
        (
            (
                -- Caso 1: Evento totalmente dentro del rango
                r.entrada >= $1::DATE AND r.salida <= $2::DATE
            )
            OR
            (
                -- Caso 2: Evento parcialmente dentro del rango
                (r.entrada < $1::DATE AND r.salida > $1::DATE)
                OR (r.entrada < $2::DATE AND r.salida > $2::DATE)
            )
            OR
            (
                -- Caso 3: Evento atraviesa el rango
                r.entrada < $1::DATE AND r.salida > $2::DATE
            )
        )
        AND r.reserva <> $3 
        AND r."estadoReserva" <> 'cancelada'
        AND r.reserva IN (
            SELECT reserva
            FROM "reservaApartamentos" 
            WHERE apartamento = ANY($4)
        )   
        GROUP BY
        r.reserva, r.entrada, r.salida; `
        const resuelveConsultaReservas = await conexion.query(consultaReservas, [fechaInicioRango_ISO, fechaFinRango_ISO, reservaUID, apartamentosIDV_array])
        return resuelveConsultaReservas.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
export {
    reservasPorRango_y_apartamentos
}