import { conexion } from "../../componentes/db.mjs";

export const obtenerBloqueosDelApartamentoPorApartamentoIDV = async (apartmamentoIDV) => {
    try {
        const consulta = `
        SELECT * 
        FROM "bloqueosApartamentos" 
        WHERE apartamento = $1`;
        const resuelve = await conexion.query(consulta, [apartmamentoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}