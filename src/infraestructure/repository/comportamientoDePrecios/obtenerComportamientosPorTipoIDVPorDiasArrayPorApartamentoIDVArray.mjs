import { conexion } from "../globales/db.mjs";
export const obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray = async (data) => {
    try {
        const tipoIDV = data.tipoIDV
        const diasArray = data.diasArray
        const apartamentosIDVArray = data.apartamentosIDVArray

        const consulta = `
        SELECT *
        FROM "comportamientoPrecios"
        WHERE
        contenedor->>'tipo' = $1
        AND
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(contenedor->'dias') AS elem
            WHERE elem::text = ANY($2::text[])
            )
        AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(contenedor->'apartamentos') AS apartamento
            WHERE apartamento->>'apartamentoIDV' = ANY($3)
        );
        `
        const parametros = [
            tipoIDV,
            diasArray,
            apartamentosIDVArray
        ]

        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
