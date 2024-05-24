import { conexion } from "../../../../componentes/db.mjs"

export const obtenerHabitacionComoEntidadPorHabitacionUI = async (habitacionUI) => {
    try {
        const consulta =  `
        SELECT
        *
        FROM habitaciones
        WHERE "habitacionUI" = $1`;
        const resuelve = await conexion.query(consulta, [habitacionUI]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ninguna habitacion como entidad con ese habitacionUI"
            throw error
        }
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}