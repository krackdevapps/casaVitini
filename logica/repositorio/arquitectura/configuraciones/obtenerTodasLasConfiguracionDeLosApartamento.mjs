import { conexion } from "../../../componentes/db.mjs";

export const obtenerTodasLasConfiguracionDeLosApartamento = async () => {
    try {
        const consulta = `
        SELECT 
        "configuracionUID",
        "apartamentoIDV",
        "estadoConfiguracionIDV",
        "zonaIDV"
        FROM
        "configuracionApartamento";
        `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}