import { conexion } from "../../globales/db.mjs";

export const obtenerCamasDeLaHabitacionPorCamaUID = async (camaUID) => {
    try {

        const consulta = `
        SELECT 
        *
        FROM "configuracionCamasEnHabitacion"
        WHERE "componenteUID" = $1
        `;
        const resuelve = await conexion.query(consulta, [camaUID])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}