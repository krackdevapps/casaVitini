import { conexion } from "../globales/db.mjs";
export const obtenerComportamientosDistintosPorTipoIDVPorDiasArrayPorApartamentoIDV_ignorandoComportamientoUID = async (data) => {
    try {
        const tipoIDV = data.tipoIDV
        const diasArray = data.diasArray
        const comportamientoUID = data.comportamientoUID
        const apartamentosIDVArray = data.apartamentosIDVArray

        const consulta = `
        SELECT *
        FROM 
        "comportamientoPrecios"
        WHERE 
        contenedor->>'tipo' = $1
        AND
          EXISTS (
                   SELECT 1
                   FROM jsonb_array_elements_text(contenedor->'dias') AS elem
                   WHERE elem::text = ANY ($2::text[])
            )
        AND
        "comportamientoUID" <> $3
        AND
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements(contenedor->'apartamentos') AS apartamento
            WHERE apartamento->>'apartamentoIDV' = ANY($4)
        );
        `
        const parametros = [
            tipoIDV,
            diasArray,
            comportamientoUID,
            apartamentosIDVArray
        ]


        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
