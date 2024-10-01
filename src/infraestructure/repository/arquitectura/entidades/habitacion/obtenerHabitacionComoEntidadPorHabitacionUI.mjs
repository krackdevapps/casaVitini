import { conexion } from "../../../globales/db.mjs"

export const obtenerHabitacionComoEntidadPorHabitacionUI = async (data) => {
    try {
        const habitacionUI = data.habitacionUI
        const errorSi = data.errorSi
        const consulta = `
        SELECT
        *
        FROM habitaciones
        WHERE "habitacionUI" = $1`;
        const resuelve = await conexion.query(consulta, [habitacionUI]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe ninguna habitacion como entidad con ese habitacionUI"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe habitacion como entidad con ese habitacionUI"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerHabitacionComoEntidadPorHabitacionIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}