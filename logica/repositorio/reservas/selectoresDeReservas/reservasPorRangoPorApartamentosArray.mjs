import { conexion } from "../../../componentes/db.mjs"

export const reservasPorRangoPorApartamentosArray = async (metadatos) => {
    try {
        const fechaInicioRango_ISO = metadatos.fechaInicioRango_ISO
        const fechaFinRango_ISO = metadatos.fechaFinRango_ISO
        const reservaUID = metadatos.reservaUID
        const apartamentosIDV_array = metadatos.apartamentosIDV_array || []
        const consultaReservas = `
        SELECT 
        r."reservaUID",        
        to_char(r."fechaEntrada", 'YYYY-MM-DD') AS "fechaEntrada_ISO", 
        to_char(r."fechaSalida", 'YYYY-MM-DD') AS "fechaSalida_ISO",
        ARRAY_AGG(ra."apartamentoIDV") AS "apartamentosIDV"    
        FROM 
        reservas r
        JOIN 
        "reservaApartamentos" ra ON r."reservaUID" = ra."reservaUID"
        WHERE               
        (
            (
                -- Caso 1: Evento totalmente dentro del rango
                r."fechaEntrada" >= $1::DATE AND r."fechaSalida" <= $2::DATE
            )
            OR
            (
                -- Caso 2: Evento parcialmente dentro del rango
                (r."fechaEntrada" < $1::DATE AND r."fechaSalida" > $1::DATE)
                OR (r."fechaEntrada" < $2::DATE AND r."fechaSalida" > $2::DATE)
            )
            OR
            (
                -- Caso 3: Evento atraviesa el rango
                r."fechaEntrada" < $1::DATE AND r."fechaSalida" > $2::DATE
            )
        )
        AND r."reservaUID" <> $3 
        AND r."estadoReservaIDV" <> 'cancelada'
        AND r."reservaUID" IN (
            SELECT "reservaUID"
            FROM "reservaApartamentos" 
            WHERE "apartamentoIDV" = ANY($4)
        )   
        GROUP BY
        r."reservaUID", r."fechaEntrada", r."fechaSalida"; `
        const resuelveConsultaReservas = await conexion.query(consultaReservas, [fechaInicioRango_ISO, fechaFinRango_ISO, reservaUID, apartamentosIDV_array])
        return resuelveConsultaReservas.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
