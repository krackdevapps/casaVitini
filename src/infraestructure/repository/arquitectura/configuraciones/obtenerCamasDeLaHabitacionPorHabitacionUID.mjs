import { conexion } from "../../globales/db.mjs";

export const obtenerCamasDeLaHabitacionPorHabitacionUID = async (habitacionUID) => {
    try {
        const consulta = `
            SELECT
            *
            FROM
            "configuracionCamasEnHabitacion"
            WHERE
            "habitacionUID" = $1;
            `
        const resuelve = await conexion.query(consulta, [habitacionUID])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}