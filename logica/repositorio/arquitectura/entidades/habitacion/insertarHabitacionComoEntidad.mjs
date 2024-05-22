import { conexion } from "../../../../componentes/db.mjs"

export const insertarHabitacionComoEntidad = async (data) => {

    const habitacionIDV = data.habitacionIDV
    const habitacionUI = data.habitacionUI

    try {
        const consulta = `
        INSERT INTO habitaciones
        (
        "habitacionIDV",
        "habitacionUI"
        )
        VALUES 
        (
        $1,
        $2
        )
        RETURNING 
        *
        `;
        const resuelve = await conexion.query(consulta, [habitacionIDV, habitacionUI]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}