import { conexion } from "../../globales/db.mjs";

export const obtenerConfiguracionDeProtocolos = async () => {
    try {
        const consulta = `
        SELECT
        *
        FROM
        protocolos."configuracionGlobal"
        `;
        
        const resuelve = await conexion.query(consulta);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}