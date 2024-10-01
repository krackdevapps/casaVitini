import { conexion } from "../globales/db.mjs";

export const obtenerTipoValorPorTipoValorIDV = async (tipoValor) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM impuestos
        WHERE "tipoValorIDV" = $1
        `;
        const resuelve = await conexion.query(consulta, [tipoValor]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}