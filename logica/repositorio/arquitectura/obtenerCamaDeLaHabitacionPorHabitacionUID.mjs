import { conexion } from "../../componentes/db.mjs";
export const obtenerCamaDeLaHabitacionPorHabitacionUID = async (data) => {
    try {
        const habitacionUID = data.habitacionUID
        const camaIDV = data.camaIDV
        const consulta = `
            SELECT
            cama
            FROM
            "configuracionCamasEnHabitacion"
            WHERE
            habitacion = $1 AND cama = $2;
            `
        const resuelve = await conexion.query(consulta, [habitacionUID, camaIDV])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }
}