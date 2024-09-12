import { conexion } from "../../../componentes/db.mjs";

export const obtenerOfertasPorRangoActualPorCodigoDescuentoArray = async (data) => {
    try {

        const zonasArray = data.zonasArray
        const entidadIDV = data.entidadIDV
        const codigosDescuentoArray = data.codigosDescuentoArray
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
                "entidadIDV" = $1::text
                AND
                "zonaIDV" = ANY($2)
                AND
                   NOT EXISTS (
                       SELECT 1
                       FROM jsonb_array_elements("condicionesArray") AS elem
                       WHERE elem->>'tipoCondicion' = 'porCodigoDescuento'
                       AND NOT (elem->>'codigoDescuento' = ANY($3))
                   );

        ;`
        const parametros = [
            entidadIDV,
            zonasArray,
            codigosDescuentoArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
