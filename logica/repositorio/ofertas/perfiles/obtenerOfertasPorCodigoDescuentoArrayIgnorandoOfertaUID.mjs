import { conexion } from "../../../componentes/db.mjs";

export const obtenerOfertasPorCodigoDescuentoArrayIgnorandoOfertaUID = async (data) => {
    try {
        const ofertaUID = data.ofertaUID
        const codigosDescuentosArray = data.codigosDescuentosArray
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
                "ofertaUID" <> $1
                AND
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements("condicionesArray") AS elem
                    WHERE elem->>'tipoCondicion' = 'porCodigoDescuento'
                      AND elem->>'codigoDescuento' = ANY($2)
                );

        ;`
        const parametros = [
            ofertaUID,
            codigosDescuentosArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
