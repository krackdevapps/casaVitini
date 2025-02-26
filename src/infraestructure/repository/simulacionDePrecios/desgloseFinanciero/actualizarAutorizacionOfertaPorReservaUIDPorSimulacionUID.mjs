import { conexion } from "../../globales/db.mjs";


export const actualizarAutorizacionOfertaPorReservaUIDPorSimulacionUID = async (data) => {
  try {
    const ofertaUID = data.ofertaUID
    const simulacionUID = data.simulacionUID
    const nuevaAutorizacion = data.nuevaAutorizacion
    const consulta = `
        WITH updated_array AS (
              SELECT
                "simulacionUID",
                jsonb_agg(
                  CASE
                    WHEN elem -> 'oferta' ->> 'ofertaUID' = $2 THEN
                      jsonb_set(elem, '{autorizacion}', to_jsonb($3::text))
                    ELSE
                      elem
                  END
                ) AS new_array
              FROM (
                SELECT "simulacionUID", jsonb_array_elements("instantaneaOfertasPorCondicion") AS elem
                FROM "simulacionesDePrecio"
                WHERE "simulacionUID" = $1
              ) subquery
              GROUP BY "simulacionUID"
            )
            UPDATE "simulacionesDePrecio"
            SET "instantaneaOfertasPorCondicion" = updated_array.new_array
            FROM updated_array
            WHERE "simulacionesDePrecio"."simulacionUID" = updated_array."simulacionUID"
            RETURNING *;`
    const parametros = [
      simulacionUID,
      ofertaUID,
      nuevaAutorizacion
    ]
    const resuelve = await conexion.query(consulta, parametros);
    if (resuelve.rowCount === 0) {
      const error = "No existe ninguna oferta dentro del contenedorFinanciero de la reserva con los datos de selección pasados."
      throw new Error(error)
    }
    return resuelve.rows[0]
  } catch (errorCapturado) {
    throw errorCapturado
  }
}

