import { conexion } from "../../../../componentes/db.mjs"

export const actualizarHabitacionComoEntidadPorHabitacionIDV = async (data) => {
    try {

        const habitacionIDVNuevo = data.habitacionIDVNuevo
        const habitacionUI = data.habitacionUI
        const habitacionIDVSelector = data.habitacionIDVSelector

        const consulta = `
        UPDATE habitaciones
        SET 
        "habitacionIDV" = COALESCE($1, "habitacionIDV"),
        "habitacionUI" = COALESCE($2, "habitacionUI")
        WHERE 
        "habitacionIDV" = $3
        RETURNING 
        *
        `;
        const parametros = [
            habitacionIDVNuevo,
            habitacionUI,
            habitacionIDVSelector
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}