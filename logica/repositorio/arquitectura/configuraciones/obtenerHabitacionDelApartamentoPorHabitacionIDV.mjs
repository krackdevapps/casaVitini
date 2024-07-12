import { conexion } from "../../../componentes/db.mjs";

export const obtenerHabitacionDelApartamentoPorHabitacionIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const habitacionIDV = data.habitacionIDV
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM
        "configuracionHabitacionesDelApartamento"
        WHERE
        "habitacionIDV" = $1
        AND  
        "apartamentoIDV" = $2;`

        const parametros = [
            habitacionIDV,
            apartamentoIDV
        ]

        const resuelve = await conexion.query(consulta, parametros)
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe la habitacion"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya exiete la habitacion en el apartamento";
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerHabitacionDelApartamentoPorHabitacionIDV necesita errorSi en existe, noExiste o desactivado"
           throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}