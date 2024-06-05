import { conexion } from "../../../../componentes/db.mjs"

export const obtenerHabitacionComoEntidadPorHabitacionIDV = async (habitacionIDV) => {
    try {
        const consulta =  `
        SELECT
        *
        FROM habitaciones
        WHERE "habitacionIDV" = $1;`;
        const resuelve = await conexion.query(consulta, [habitacionIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ninguna habitacion como entidad con ese habitacionIDV"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}