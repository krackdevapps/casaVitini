import { conexion } from "../../componentes/db.mjs";

export const obtenerCamaPorHabitacion = async (data) => {
    try {

        const habitacionUID = data.habitacionUID
        const camaIDV = data.camaIDV

        const consultaCamasDeHabitacion = `
            SELECT
            cama
            FROM
            "configuracionCamasEnHabitacion"
            WHERE
            habitacion = $1 AND cama = $2;
            `
        const resuelve = await conexion.query(consultaCamasDeHabitacion, [habitacionUID, camaIDV])
        return resuelve.rows
    } catch (errorCapturado) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }





}