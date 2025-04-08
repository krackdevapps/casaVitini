import { conexion } from "../../globales/db.mjs"

export const reservasPorRangoSoloFechaEntradaPorApartamentosArray = async (metadatos) => {
    try {
        const fechaInicioRango_ISO = metadatos.fechaInicioRango_ISO
        const fechaFinRango_ISO = metadatos.fechaFinRango_ISO
        const apartamentosIDV_array = metadatos.apartamentosIDV_array || []
        const consultaReservas = `
        SELECT 
        r."reservaUID",        
        to_char(r."fechaEntrada", 'YYYY-MM-DD') AS "fechaEntrada", 
        to_char(r."fechaSalida", 'YYYY-MM-DD') AS "fechaSalida",
        ARRAY_AGG(ra."apartamentoIDV") AS "apartamentosIDV"    
        FROM 
        reservas r
        JOIN 
        "reservaApartamentos" ra ON r."reservaUID" = ra."reservaUID"
        WHERE               
            (
            r."fechaEntrada" BETWEEN $1 AND $2
            )
        
        AND r."estadoReservaIDV" <> 'cancelada'
        AND r."reservaUID" IN (
            SELECT "reservaUID"
            FROM "reservaApartamentos" 
            WHERE "apartamentoIDV" = ANY($3)
        )   
        GROUP BY
        r."reservaUID", r."fechaEntrada", r."fechaSalida"; `

        const p = [
            fechaInicioRango_ISO,
            fechaFinRango_ISO,
            apartamentosIDV_array
        ]
        const resuelveConsultaReservas = await conexion.query(consultaReservas, p)
        return resuelveConsultaReservas.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
