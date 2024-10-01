import { conexion } from "../../../globales/db.mjs";
export const eliminarSobreControlApartamentoPorNochePorArrayDeFechas = async (data) => {
  try {
    const reservaUID = data.reservaUID
    const fechasNochesARRAY = data.fechasNochesARRAY
    const consultaBorradoApartamento = `
    UPDATE
    "reservaFinanciero"
    SET
    "instantaneaSobreControlPrecios" = (
      SELECT jsonb_object_agg(key, value)
      FROM jsonb_each("instantaneaSobreControlPrecios") AS elem(key, value)
      WHERE key <> ALL($2::text[])
      )
    WHERE "reservaUID" = $1
    RETURNING *;
`;
    const parametros = [
      reservaUID,
      fechasNochesARRAY,
    ]
    const resuelve = await conexion.query(consultaBorradoApartamento, parametros);
    return resuelve.rows[0]

  } catch (errorCapturado) {
    throw errorCapturado
  }
}

