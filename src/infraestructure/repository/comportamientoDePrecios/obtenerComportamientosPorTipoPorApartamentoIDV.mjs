import { conexion } from "../globales/db.mjs";
export const obtenerComportamientosPorTipoPorApartamentoIDV = async (data) => {
    try {
        const tiposIDVArray = data.tiposIDVArray
        const apartamentosIDVArray = data.apartamentosIDVArray
        const consulta = `
        SELECT *
        FROM 
        "comportamientoPrecios"
        WHERE
        (contenedor->>'tipo' = ANY($1))
        AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(contenedor->'apartamentos') AS apartamento
            WHERE apartamento->>'apartamentoIDV' = ANY($2)
        )
        `
        const parametros = [
            tiposIDVArray,
            apartamentosIDVArray
        ]

        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
