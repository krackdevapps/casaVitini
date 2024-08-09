import { conexion } from "../../../componentes/db.mjs"

export const obtenerCamasFisicasPorReservaUIDArrayPorCamaIDV = async (data) => {
    try {
        const reservaUID_array = data.reservaUID_array
        const camaIDV = data.camaIDV
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaCamasFisicas" 
        WHERE 
        "reservaUID" = ANY($1)
        AND
        "camaIDV" = $2;`;
        const parametros = [
            reservaUID_array,
            camaIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra la cama física dentro de la reserva."
                throw new Error(error)
            }
            return resuelve.rows
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe la cama física en la reserva."
                throw new Error(error)
            }
            return resuelve.rows
        } else if (errorSi === "desactivado") {
            return resuelve.rows
        } else {
            const error = "El adaptador obtenerCamasFisicasPorReservaUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

