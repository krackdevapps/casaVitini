import { conexion } from "../../globales/db.mjs"

export const insertarCamaFisicaEnLaHabitacion = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID
        const nuevaCamaIDV = data.nuevaCamaIDV
        const camaUI = data.camaUI

        const consulta = `
        INSERT INTO "reservaCamasFisicas"
        (
        "reservaUID",
        "habitacionUID",
        "camaIDV",
        "camaUI"
        )
        VALUES ($1, $2, $3, $4)
        RETURNING "componenteUID"
        `;
        const parametros = [
            reservaUID,
            habitacionUID,
            nuevaCamaIDV,
            camaUI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const msg = "No se ha insertado la cama en la habitación."
            throw new Error(msg)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

