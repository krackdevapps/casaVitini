import { conexion } from '../../componentes/db.mjs';
export const obtenerTodasLasCaracteristicasDelApartamento = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        caracteristica
        FROM "apartamentosCaracteristicas" 
        WHERE "apartamentoIDV" = $1;`;
        const resolucionNombre = await conexion.query(consulta, [apartamentoIDV])
        return resolucionNombre.rows
    } catch (error) {
        throw error
    }
}
