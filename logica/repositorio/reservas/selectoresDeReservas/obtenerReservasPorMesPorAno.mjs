import { conexion } from "../../../componentes/db.mjs"

export const obtenerReservasPorMes = async (data) => {
    try {
        const mes = data.mes
        const ano = data.ano
        const estadoReservaCancelada = data.estadoReservaCancelada
        const consulta = `
        SELECT 
        reserva,
        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada", 
        to_char(salida, 'YYYY-MM-DD') as "fechaSalida"
        FROM 
        reservas
        WHERE
        (
            DATE_PART('YEAR', entrada) < $2
            OR (
                DATE_PART('YEAR', entrada) = $2
                AND DATE_PART('MONTH', entrada) <= $1
            )
        )
        AND 
        (
            DATE_PART('YEAR', salida) > $2
            OR (
                DATE_PART('YEAR', salida) = $2
                AND DATE_PART('MONTH', salida) >= $1
            )
        )
        AND "estadoReserva" <> $3
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

