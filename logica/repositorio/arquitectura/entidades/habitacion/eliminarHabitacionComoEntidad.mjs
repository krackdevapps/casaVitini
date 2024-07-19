import { conexion } from "../../../../componentes/db.mjs"

export const eliminarHabitacionComoEntidad = async (habitacionIDV) => {
    try {
        const consulta = `
        DELETE FROM "habitaciones"
        WHERE "habitacionIDV" = $1
        RETURNING
        *;`;
        const resuelve = await conexion.query(consulta, [habitacionIDV]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}