import { conexion } from "../globales/db.mjs";

export const obtenerBloqueosPorTipoIDVPorApartamentoIDV = async (data) => {
    try {
        const tipoBloqueoIDV = data.tipoBloqueoIDV
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        SELECT 
        *
        FROM 
        "bloqueosApartamentos" 
        WHERE 
        "tipoBloqueoIDV" = $1
        AND
        "apartamentoIDV" = $2;`;

        const parametros = [
            tipoBloqueoIDV,
            apartamentoIDV
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}