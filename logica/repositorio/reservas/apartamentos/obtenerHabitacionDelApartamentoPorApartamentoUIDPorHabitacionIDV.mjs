import { conexion } from "../../../componentes/db.mjs";

export const obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV = async (data) => {
    try {

        const apartamentoUID = data.apartamentoUID
        const habitacionIDV = data.habitacionIDV
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

        if (resuelve.rowCount > 0) {
            const error = "Ya existe la habitación en el apartamento.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}