import { conexion } from "../../../componentes/db.mjs"

export const obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID
        const camaIDV = data.camaIDV
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaCamasFisicas" 
        WHERE 
        "reservaUID" = $1 
        AND
        "habitacionUID" = $2
        AND
        "camaIDV" = $3;`;
        const parametros = [
            reservaUID,
            habitacionUID,
            camaIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra la cama física en la habitación."
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "existe") {

            if (resuelve.rowCount > 0) {
                const error = "Ya existe la cama física en la habitación."
                throw new Error(error)
            }

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

