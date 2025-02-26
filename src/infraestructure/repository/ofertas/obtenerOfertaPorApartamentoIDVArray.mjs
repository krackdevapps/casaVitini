
import { conexion } from "../globales/db.mjs";
export const obtenerOfertaPorApartamentoIDVArray = async (data) => {
    try {

        const apartamentosIDVArray = data.apartamentosIDVArray
        const consulta = `
            SELECT *
            FROM ofertas
            WHERE 
                (
                    EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements("condicionesArray"::jsonb) AS condiciones
                        WHERE 
                            condiciones->>'tipoCondicion' = 'porApartamentosEspecificos'
                            AND EXISTS (
                                SELECT 1
                                FROM jsonb_array_elements(condiciones->'apartamentos') AS apt
                                WHERE apt->>'apartamentoIDV' = ANY($1)
                            )
                    )
                )
                OR
                (
                    "descuentosJSON"::jsonb->>'tipoDescuento' = 'individualPorApartamento'
                    AND
                    EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements("descuentosJSON"::jsonb->'apartamentos') AS apt
                        WHERE apt->>'apartamentoIDV' = ANY($1)
                        )
                )
                OR
                (
                    "descuentosJSON"::jsonb->>'tipoDescuento' = 'porRango'
                    AND
                    "descuentosJSON"::jsonb->>'subTipoDescuento' = 'porDiasDelRango'
                    AND
                    EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements("descuentosJSON"::jsonb->'descuentoPorDias') AS dia
                        WHERE EXISTS (
                            SELECT 1
                                FROM jsonb_array_elements(dia->'apartamentos') AS apt
                                WHERE apt->>'apartamentoIDV' = ANY($1)
                            )
                        )
                );
        `
        const parametros = [
            apartamentosIDVArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
