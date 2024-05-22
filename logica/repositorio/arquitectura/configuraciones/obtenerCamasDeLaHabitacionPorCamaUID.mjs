import { conexion } from "../../../componentes/db.mjs";

export const obtenerCamasDeLaHabitacionPorCamaUID = async (camaUID) => {
    try {

        const consulta =`
        SELECT 
        *
        FROM "configuracionCamasEnHabitacion"
        WHERE uid = $1
        `;
        const resuelve = await conexion.query(consulta, [camaUID])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }

}