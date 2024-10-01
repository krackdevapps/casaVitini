import { conexion } from "../globales/db.mjs";

export const obtenerBloqueosPorTipoIDVPorApartamentoIDV = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const tipoBloqueoIDV = data.tipoBloqueoIDV

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
            apartamentoIDV,
            tipoBloqueoIDV
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}