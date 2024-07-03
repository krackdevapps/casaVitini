import { conexion } from "../../../componentes/db.mjs"

export const obtenerCamasFisicasPorReservaUIDPorHabitacionUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const habitacionUID = data.habitacionUID
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaCamasFisicas" 
        WHERE 
        "reservaUID" = $1 
        AND
        "habitacionUID" = $2;`;
        const parametros = [
            reservaUID,
            habitacionUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra la cama fisica en la habitacio de la reserva"
                throw new Error(error)
            }
            return resuelve.rows
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe la cama fisica en la habitacion de la reserva"
                throw new Error(error)
            }
            return resuelve.rows
        } else if (errorSi === "desactivado") {
            return resuelve.rows
        } else {
            const error = "el adaptador obtenerCamasFisicasPorReservaUIDPorHabitacionUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

