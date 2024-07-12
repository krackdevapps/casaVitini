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
                const error = "No se encuentra la cama fisica en la habitacion"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "existe") {
            console.log("esuelve.rowCount ", resuelve.rowCount )
            if (resuelve.rowCount > 0) {
                const error = "Ya existe la cama fisica en la habitacion"
                throw new Error(error)
            }

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerCamaFisicaPorReservaUIDPorHabitacionUIDPorCamaIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

