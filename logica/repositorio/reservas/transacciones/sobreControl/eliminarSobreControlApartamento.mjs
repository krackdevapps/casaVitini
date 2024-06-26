import { conexion } from "../../../../componentes/db.mjs";
export const eliminarSobreControlApartamento = async (data) => {
  try {
    const reservaUID = data.reservaUID
    const fechaNoche = data.fechaNoche
    const apartamentoIDV = data.apartamentoIDV
    const consulta = `
    UPDATE
      "reservaFinanciero"
    SET
      "instantaneaSobreControlPrecios" = jsonb_set(
      "instantaneaSobreControlPrecios",
      ARRAY[$2],
      ("instantaneaSobreControlPrecios"->$2) - $3
        )
    WHERE
      "reservaUID" = $1
    RETURNING
      "instantaneaSobreControlPrecios"->$2;`;
    const parametros = [
      reservaUID,
      fechaNoche,
      apartamentoIDV
    ]
    const resuelve = await conexion.query(consulta, parametros);
    return resuelve.rows[0]
  } catch (errorCapturado) {
    throw errorCapturado
  }
}

