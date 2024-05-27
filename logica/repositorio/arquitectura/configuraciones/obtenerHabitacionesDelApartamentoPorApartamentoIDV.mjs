import { conexion } from "../../../componentes/db.mjs";

export const obtenerHabitacionesDelApartamentoPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        "configuracionHabitacionesDelApartamento"
        WHERE
        "apartamentoIDV" = $1;
        `
        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}