import { conexion } from "../../../globales/db.mjs"
export const obtenerTodasLasCaracteristicasDelApartamento = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM "apartamentosCaracteristicas" 
        WHERE "apartamentoIDV" = $1;`;
        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
