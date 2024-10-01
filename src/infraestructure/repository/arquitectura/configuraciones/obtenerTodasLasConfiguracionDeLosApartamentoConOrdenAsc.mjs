import { conexion } from "../../globales/db.mjs";

export const obtenerTodasLasConfiguracionDeLosApartamentoConOrdenAsc = async () => {
    try {
        const consulta = `
        SELECT 
        "configuracionUID",
        "apartamentoIDV",
        "estadoConfiguracionIDV",
        "zonaIDV"
        FROM
        "configuracionApartamento"
        ORDER BY
        "apartamentoIDV" ASC;`;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}