import { conexion } from "../../globales/db.mjs";

export const obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuento = async (data) => {
    try {

        const fechaActual = data.fechaActual
        const estadoIDV = data.estadoIDV
        const zonasArray = data.zonasArray
        const entidadIDV = data.entidadIDV
        const codigoDescuento = data.codigoDescuento
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
                AND
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements("condicionesArray") AS elem
                    WHERE elem->>'tipoCondicion' = 'porCodigoDescuento'
                      AND elem->>'codigoDescuento' = $5
                );

        ;`
        const parametros = [
            fechaActual,
            estadoIDV,
            entidadIDV,
            zonasArray,
            codigoDescuento
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
