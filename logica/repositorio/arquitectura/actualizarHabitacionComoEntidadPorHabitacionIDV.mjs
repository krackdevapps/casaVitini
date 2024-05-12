import { conexion } from "../../componentes/db.mjs";

export const actualizarHabitacionComoEntidadPorHabitacionIDV = async (data) => {
    try {

        const habitacionIDV = data.habitacionIDV
        const habitacionUI = data.habitacionUI
        const entidadIDV = data.entidadIDV

        const consulta = `
        UPDATE habitaciones
        SET 
        habitacion = COALESCE($1, habitacion),
        "habitacionUI" = COALESCE($2, "habitacionUI")
        WHERE habitacion = $3
        `;
        const parametros = [
            habitacionIDV,
            habitacionUI,
            entidadIDV
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}