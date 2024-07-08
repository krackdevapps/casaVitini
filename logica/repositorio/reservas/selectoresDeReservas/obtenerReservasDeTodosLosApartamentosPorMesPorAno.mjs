import { conexion } from "../../../componentes/db.mjs"
export const obtenerReservasDeTodosLosApartamentosPorMesPorAno = async (data) => {
    try {

        const mes = data.mes
        const ano = data.ano
        const reservaCancelada = data.reservaCancelada

        const consulta = `
        SELECT 
          r.reserva,
          ra.uid,
          to_char(r.entrada, 'YYYY-MM-DD') as "fechaEntrada", 
          to_char(r.salida, 'YYYY-MM-DD') as "fechaSalida",
          ra.apartamento as "apartamentoIDV",
          (salida - entrada) as duracion_en_dias
        FROM reservas r
        JOIN "reservaApartamentos" ra ON r.reserva = ra.reserva 
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
          AND "estadoReserva" <> $3;
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