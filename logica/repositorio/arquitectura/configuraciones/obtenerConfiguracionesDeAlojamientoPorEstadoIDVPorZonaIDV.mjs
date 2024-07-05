import { conexion } from "../../../componentes/db.mjs";

export const obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV = async (data) => {
    try {
        const estadoIDV = data.estadoIDV
        const zonaArray = data.zonaArray
        const consulta = `
        SELECT 
        "apartamentoIDV",
        "estadoConfiguracionIDV",
        "zonaIDV"
        FROM
         "configuracionApartamento"
         WHERE
         "estadoConfiguracionIDV" = $1
         AND
         "zonaIDV" = ANY($2)
        `;
        const parametros = [
            estadoIDV,
            zonaArray
        ]


        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}