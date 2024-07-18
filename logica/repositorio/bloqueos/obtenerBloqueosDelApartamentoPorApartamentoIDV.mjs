import { conexion } from "../../componentes/db.mjs";

export const obtenerBloqueosDelApartamentoPorApartamentoIDV = async (apartmamentoIDV) => {
    try {
        const consulta = `
        SELECT
        "bloqueoUID",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin",
        "apartamentoIDV",
        "tipoBloqueoIDV",
        motivo,
        "zonaIDV" 
        FROM "bloqueosApartamentos" 
        WHERE "apartamentoIDV" = $1`;
        const resuelve = await conexion.query(consulta, [apartmamentoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}