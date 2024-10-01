import { conexion } from "../../globales/db.mjs";

export const obtenerOfertasPorCodigoDescuentoArray = async (codigoDescuentoArray) => {
    try {
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
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements("condicionesArray") AS elem
                    WHERE elem->>'tipoCondicion' = 'porCodigoDescuento'
                      AND elem->>'codigoDescuento' = ANY($1)
                );
        ;`
        const resuelve = await conexion.query(consulta, [codigoDescuentoArray])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
