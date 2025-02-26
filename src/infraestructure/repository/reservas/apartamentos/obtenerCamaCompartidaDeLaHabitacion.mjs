import { conexion } from "../../globales/db.mjs"

export const obtenerCamaCompartidaDeLaHabitacion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID

        const consulta = `
        SELECT 
        *
        FROM 
        "reservaCamas" 
        WHERE 
        "reservaUID" = $1 
        AND
        "habitacionUID" = $2;`;
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

