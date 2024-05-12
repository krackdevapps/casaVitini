import { conexion } from "../../componentes/db.mjs";

export const obtenerCamasDeLaHabitacionPorHabitacionUID = async (habitacionUID) => {
    try {

        const consulta = `
            SELECT
            *
            FROM
            "configuracionCamasEnHabitacion"
            WHERE
            habitacion = $1;
            `
        const resuelve = await conexion.query(consulta, [habitacionUID])
        return resuelve.rows
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }

}