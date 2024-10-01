import { conexion } from "../globales/db.mjs";
export const obtenerComportamientosPorTipoIDVPorDiasArray = async (data) => {
    try {
        const tipoIDV = data.tipoIDV
        const diasArray = data.diasArray

        const consulta = `
        SELECT *
        FROM "comportamientoPrecios"
        WHERE
        contenedor->>'tipo' = $1
        AND
            EXISTS (
                   SELECT 1
                   FROM jsonb_array_elements_text(contenedor->'dias') AS elem
                   WHERE elem::text = ANY ($2::text[])
            );;
            `
        const parametros = [
            tipoIDV,
            diasArray
        ]

        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
