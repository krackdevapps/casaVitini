import { conexion } from "../../../../componentes/db.mjs";

export const eliminarImpuestoPorImpuestoUIDPorReservaUID = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const impuestoUID = data.impuestoUID
        const consulta = `
            UPDATE "reservaFinanciero" AS rf
            SET "instantaneaImpuestos" = (
              SELECT jsonb_agg(elem ORDER BY idx)
              FROM jsonb_array_elements(rf."instantaneaImpuestos") WITH ORDINALITY AS arr(elem, idx)
              WHERE elem->>'impuestoUID' <> $2 
            )
            WHERE "reservaUID" = $1
            RETURNING "instantaneaImpuestos";
        `
        const parametros = [
            reservaUID,
            impuestoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

