import { conexion } from "../../globales/db.mjs"

export const obtenerHabitacionDelLaReserva = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        SELECT 
        *
        FROM "reservaHabitaciones"
        WHERE 
        "reservaUID" = $1 
        AND 
        "componenteUID" = $2
        `;
        const parametros = [
            reservaUID,
            habitacionUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe la habitación dentro de esta reserva.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

