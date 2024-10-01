import { conexion } from "../../globales/db.mjs";

export const obtenerOfertasPorRangoActualPorEstado = async (data) => {
    try {

        const fechaActual = data.fechaActual
        const estadoIDV = data.estadoIDV
        const zonasArray = data.zonasArray
        const entidadIDV = data.entidadIDV
        const consulta = `
        SELECT 
        "ofertaUID",
        "nombreOferta",
        "entidadIDV",
        "estadoIDV",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal", 
        "condicionesArray",
        "descuentosJSON"
        FROM
        ofertas
        WHERE
        ($1 BETWEEN "fechaInicio" AND "fechaFinal")
        AND
        "estadoIDV" = $2::text
        AND
        "entidadIDV" = $3::text
        AND
        "zonaIDV" = ANY($4)
        ;`
        const parametros = [
            fechaActual,
            estadoIDV,
            entidadIDV,
            zonasArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
