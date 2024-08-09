import { conexion } from "../../../../componentes/db.mjs";


export const actualizarAutorizacionOfertaPorReservaUIDPorOfertaUID = async (data) => {
  try {
    const ofertaUID = data.ofertaUID
    const reservaUID = data.reservaUID
    const nuevaAutorizacion = data.nuevaAutorizacion
    const consulta = `
        WITH updated_array AS (
              SELECT
                "reservaUID",
                jsonb_agg(
                  CASE
                    WHEN elem -> 'oferta' ->> 'ofertaUID' = $2 THEN
                      jsonb_set(elem, '{autorizacion}', to_jsonb($3::text))
                    ELSE
                      elem
                  END
                ) AS new_array
              FROM (
                SELECT "reservaUID", jsonb_array_elements("instantaneaOfertasPorCondicion") AS elem
                FROM "reservaFinanciero"
                WHERE "reservaUID" = $1
              ) subquery
              GROUP BY "reservaUID"
            )
            UPDATE "reservaFinanciero"
            SET "instantaneaOfertasPorCondicion" = updated_array.new_array
            FROM updated_array
            WHERE "reservaFinanciero"."reservaUID" = updated_array."reservaUID"
            RETURNING *;`
    const parametros = [
      reservaUID,
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

