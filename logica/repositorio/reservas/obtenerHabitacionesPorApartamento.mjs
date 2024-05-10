import { conexion } from "../../componentes/db.mjs";

export const obtenerHabitacionesPorApartamento = async (apartamentoIDV) => {
    try {
        const consultaHabitacionesPorApartamento = `
        SELECT 
        habitacion,
        uid
        FROM
        "configuracionHabitacionesDelApartamento"
        WHERE
        apartamento = $1;
        `
        const resuelveConsultaHabitacionesPorApartamento = await conexion.query(consultaHabitacionesPorApartamento, [apartamentoIDV])
        const habitacionesPorApartamento = resuelveConsultaHabitacionesPorApartamento.rows
        return habitacionesPorApartamento
    } catch (errorCapturado) {
        const error = "Error en el adaptador obtenerHabitacionesPorApartamento"
        throw new Error(error)
    }
}