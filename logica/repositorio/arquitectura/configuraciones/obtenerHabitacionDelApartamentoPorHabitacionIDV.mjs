import { conexion } from "../../../componentes/db.mjs";

export const obtenerHabitacionDelApartamentoPorHabitacionIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const habitacionIDV = data.habitacionIDV
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
        if (resuelve.rowCount === 0) {
            const error = "No existe ningua habitacion dentro del apartmento con ese habitacionIDV";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}