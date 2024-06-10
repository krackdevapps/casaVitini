import { conexion } from "../../../componentes/db.mjs";
export const obtenerCamaDeLaHabitacionPorHabitacionUID = async (data) => {
    try {
        const habitacionUID = data.habitacionUID
        const camaIDV = data.camaIDV
        const consulta = `
            SELECT
            *
            FROM
            "configuracionCamasEnHabitacion"
            WHERE
            "habitacionUID" = $1 AND "camaIDV" = $2;
            `
        const resuelve = await conexion.query(consulta, [habitacionUID, camaIDV])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}