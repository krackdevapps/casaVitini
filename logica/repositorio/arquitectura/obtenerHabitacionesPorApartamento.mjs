import { conexion } from "../../componentes/db.mjs";

export const obtenerHabitacionesPorApartamento = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        habitacion,
        uid
        FROM
        "configuracionHabitacionesDelApartamento"
        WHERE
        apartamento = $1;
        `
        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}