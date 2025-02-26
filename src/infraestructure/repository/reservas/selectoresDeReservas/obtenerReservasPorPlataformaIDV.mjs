import { conexion } from "../../globales/db.mjs"


export const obtenerReservasPorApartamentoIDVPorMesPorAno = async (data) => {
    try {

        const mes = data.mes
        const ano = data.ano
        const apartamentoIDV = data.apartamentoIDV
        const reservaCancelada = data.reservaCancelada

        const consulta = `
        SELECT 
          r."reservaUID",
          ra."componenteUID",
          to_char(r."fechaEntrada", 'YYYY-MM-DD') as "fechaEntrada", 
          to_char(r."fechaSalida", 'YYYY-MM-DD') as "fechaSalida",
          ra."apartamentoIDV" as "apartamentoIDV",
          ("fechaSalida" - "fechaEntrada") as duracion_en_dias
        FROM reservas r
        JOIN "reservaApartamentos" ra ON r."reservaUID" = ra."reservaUID"
        WHERE 
       ( 
        (
            DATE_PART('YEAR', "fechaEntrada") < $2
            OR (
                DATE_PART('YEAR', "fechaEntrada") = $2
                AND DATE_PART('MONTH', "fechaEntrada") <= $1
            )
        )
        AND (
            DATE_PART('YEAR', "fechaSalida") > $2
            OR (
                DATE_PART('YEAR', "fechaSalida") = $2
                AND DATE_PART('MONTH', "fechaSalida") >= $1
            )
        )
        )
          AND ra."apartamentoIDV" = $3
          AND "estadoReservaIDV" <> $4;
        `
        const parametros = [
            mes,
            ano,
            apartamentoIDV,
            reservaCancelada
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}