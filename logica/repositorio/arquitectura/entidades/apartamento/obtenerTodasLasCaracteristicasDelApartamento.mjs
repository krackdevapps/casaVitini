import { conexion } from "../../../../componentes/db.mjs"
export const obtenerTodasLasCaracteristicasDelApartamento = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM "apartamentosCaracteristicas" 
        WHERE "apartamentoIDV" = $1;`;
        const resolucionNombre = await conexion.query(consulta, [apartamentoIDV])
        return resolucionNombre.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
