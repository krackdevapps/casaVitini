import { conexion } from "../../../componentes/db.mjs"

export const obtenerCamaDeLaHabitacion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        SELECT "componenteUID" 
        FROM "reservaCamas" 
        WHERE "reservaUID" = $1 AND "habitacionUID" = $2;`;
        const parametros = [
            reservaUID,
            habitacionUID
        ]
        const resuelve = await conexion.query(consulta, [parametros]);
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

