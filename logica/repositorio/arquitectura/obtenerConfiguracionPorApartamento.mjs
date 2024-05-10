import { conexion } from "../../componentes/db.mjs";

export const obtenerConfiguracionPorApartamento = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        uid,
        "apartamentoIDV",
        "estadoConfiguracion"
        FROM "configuracionApartamento"
        WHERE "apartamentoIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}