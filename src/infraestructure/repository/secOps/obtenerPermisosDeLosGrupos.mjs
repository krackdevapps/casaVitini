import { conexion } from "../globales/db.mjs";

export const obtenerPermisosDeLosGrupos = async () => {
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