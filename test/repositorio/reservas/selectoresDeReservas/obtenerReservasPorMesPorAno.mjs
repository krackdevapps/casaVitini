import { conexion } from "../../componentes/db.mjs";

export const obtenerReservasPorMesPorAno = async (data) => {
    try {

        const mes = data.mes
        const ano = data.ano
        const reservaCancelada = data.reservaCancelada

        const consulta = `
        SELECT 
        reserva,
        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
        (salida - entrada) as duracion_en_dias
        FROM reservas
        WHERE
        (
            DATE_PART('YEAR', entrada) < $2
            OR (
                DATE_PART('YEAR', entrada) = $2
                AND DATE_PART('MONTH', entrada) <= $1
            )
        )
        AND (
            DATE_PART('YEAR', salida) > $2
            OR (
                DATE_PART('YEAR', salida) = $2
                AND DATE_PART('MONTH', salida) >= $1
            )
        )
            AND "estadoReserva" <> $3
        ORDER BY duracion_en_dias DESC;
        `
        const parametros = [
            mes,
            ano,
            reservaCancelada
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}