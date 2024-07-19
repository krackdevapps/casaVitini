import { conexion } from "../../../../componentes/db.mjs"

export const obtenerHabitacionComoEntidadPorHabitacionIDV = async (data) => {
    try {
        const habitacionIDV = data.habitacionIDV
        const errorSi = data.errorSi
        const consulta = `
        SELECT
        *
        FROM habitaciones
        WHERE "habitacionIDV" = $1;`;
        const resuelve = await conexion.query(consulta, [habitacionIDV]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe ninguna habitacion como entidad con ese habitacionIDV"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe la habitacion como entidad con ese habitacionIDV"
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