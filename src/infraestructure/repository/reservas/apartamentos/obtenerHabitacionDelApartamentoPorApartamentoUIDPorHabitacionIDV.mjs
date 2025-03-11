import { conexion } from "../../globales/db.mjs";

export const obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV = async (data) => {
    try {

        const apartamentoUID = data.apartamentoUID
        const habitacionIDV = data.habitacionIDV
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM
        "reservaHabitaciones"
        WHERE
        "habitacionIDV" = $1
        AND  
        "apartamentoUID" = $2;`

        const parametros = [
            habitacionIDV,
            apartamentoUID
        ]
        const resuelve = await conexion.query(consulta, parametros)

        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe la habitacion en el apartamento"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe la habitación en el apartamento."
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}