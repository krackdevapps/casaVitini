import { conexion } from "../../globales/db.mjs"

export const obtenerReservasPorMesPorAno = async (data) => {
    try {
        const mes = data.mes
        const ano = data.ano
        const estadoReservaCancelada = data.estadoReservaCancelada

        const consulta = `
        SELECT 
        "reservaUID",
        to_char("fechaEntrada", 'YYYY-MM-DD') as "fechaEntrada", 
        to_char("fechaSalida", 'YYYY-MM-DD') as "fechaSalida",
        ("fechaSalida" - "fechaEntrada") as duracion_en_dias

        FROM 
        reservas
        WHERE
        (
            DATE_PART('YEAR', "fechaEntrada") < $2
            OR (
                DATE_PART('YEAR', "fechaEntrada") = $2
                AND DATE_PART('MONTH', "fechaEntrada") <= $1
            )
        )
        AND 
        (
            DATE_PART('YEAR', "fechaSalida") > $2
            OR (
                DATE_PART('YEAR', "fechaSalida") = $2
                AND DATE_PART('MONTH', "fechaSalida") >= $1
            )
        )
        AND "estadoReservaIDV" <> $3
       `;
        const parametros = [
            mes,
            ano,
            estadoReservaCancelada
        ]


        const resuelve = await conexion.query(consulta, parametros);

        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

