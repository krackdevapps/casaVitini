import { conexion } from "../../globales/db.mjs";

export const eliminarImpuestoPorImpuestoUIDPorSimulacionUID = async (data) => {
    try {

        const simulacionUID = data.simulacionUID
        const impuestoUID = data.impuestoUID
        const consulta = `
            UPDATE "simulacionesDePrecio" AS rf
            SET "instantaneaImpuestos" = (
              SELECT jsonb_agg(elem ORDER BY idx)
              FROM jsonb_array_elements(rf."instantaneaImpuestos") WITH ORDINALITY AS arr(elem, idx)
              WHERE elem->>'impuestoUID' <> $2 
            )
            WHERE "simulacionUID" = $1
            RETURNING "instantaneaImpuestos";
        `
        const parametros = [
            simulacionUID,
            impuestoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

