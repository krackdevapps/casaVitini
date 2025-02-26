import { conexion } from "../../globales/db.mjs";

export const obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV = async (data) => {
    try {
        const estadoConfiguracionIDV = data.estadoConfiguracionIDV
        const zonaArray = data.zonaArray
        const apartamentoIDV = data.apartamentoIDV
        const errorSi = data.errorSi
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
         AND
         "apartamentoIDV" = $3
        `;
        const parametros = [
            estadoConfiguracionIDV,
            zonaArray,
            apartamentoIDV
        ]

        const resuelve = await conexion.query(consulta, parametros)
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = `No se encuentra ningúna configuración de alojamiento con el apartamentoIDV: ${apartamentoIDV}`
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un apartamento como entidad con ese apartamentoIDV"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}