import { conexion } from "../../globales/db.mjs"

export const obtenerHabitacionDelApartamentoEnReservaPorHabitacionUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID
        const consulta = `
        SELECT 
        *
        FROM
        "reservaHabitaciones"
        WHERE
        "reservaUID" = $1
        AND
        "componenteUID" = $2 ; 
        `;
        const parametros = [
            reservaUID,
            habitacionUID
        ]

        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

