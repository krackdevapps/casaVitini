import { conexion } from "../../globales/db.mjs"

export const actualizaCamaDeLaHabitacion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID
        const nuevaCamaIDV = data.nuevaCamaIDV
        const camaUI = data.camaUI

        const consulta = `
        UPDATE "reservaCamas"
        SET
        "camaIDV" = $3,
        "camaUI" = $4
        WHERE
        "reservaUID" = $1
        AND 
        "habitacionUID" = $2;`;
        const parametros = [
            reservaUID,
            habitacionUID,
            nuevaCamaIDV,
            camaUI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const msg = "No se ha actualizado la cama en la habitación."
            throw new Error(msg)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

