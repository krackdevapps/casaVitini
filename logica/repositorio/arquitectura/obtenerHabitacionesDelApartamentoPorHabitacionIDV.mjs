import { conexion } from "../../componentes/db.mjs";

export const obtenerHabitacionesDelApartamentoPorHabitacionIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const habitacionIDV = data.habitacionIDV
        const consulta = `
        SELECT 
        "habitacionIDV",
        "componenteUID"
        FROM
        "configuracionHabitacionesDelApartamento"
        WHERE
        "habitacionIDV" = $1;
        AND  
        "apartamentoIDV" = $1;
        `
        const parametros = {
            habitacionIDV,
            apartamentoIDV
        }
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}