import { conexion } from "../../../componentes/db.mjs"

export const eliminarHabitacionDelApartamento = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        DELETE FROM 
        "reservaHabitaciones"
        WHERE 
        "componenteUID" = $1 
        AND 
        "reservaUID" = $2;
        `;
        const parametros = [
            habitacionUID,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se puede eliminar la habitación porque no se encuentra dentro de la reserva."
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

