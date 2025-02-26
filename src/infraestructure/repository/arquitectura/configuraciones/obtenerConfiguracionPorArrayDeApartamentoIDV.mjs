import { conexion } from "../../globales/db.mjs";

export const obtenerConfiguracionPorArrayDeApartamentoIDV = async (arrayApartamentoIDV) => {
    try {
        const consulta = `
        SELECT
        "apartamentoIDV"
        FROM
        "configuracionApartamento"
        WHERE
        "apartamentoIDV" = ANY($1)
        `;
        const resuelve = await conexion.query(consulta, [arrayApartamentoIDV]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}