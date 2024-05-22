import { conexion } from "../../../../componentes/db.mjs"

export const eliminarHabitacionComoEntidad = async (habitacionIDV) => {
    try {
        const consulta = `
        DELETE FROM "habitaciones"
        WHERE "habitacionIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [habitacionIDV]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}