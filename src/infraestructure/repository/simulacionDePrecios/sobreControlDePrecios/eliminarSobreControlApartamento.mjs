import { conexion } from "../../globales/db.mjs";
export const eliminarSobreControlApartamento = async (data) => {
  try {
    const simulacionUID = data.simulacionUID
    const fechaNoche = data.fechaNoche
    const apartamentoIDV = data.apartamentoIDV
    const consultaBorradoApartamento = `
    UPDATE
      "simulacionesDePrecio"
    SET
      "instantaneaSobreControlPrecios" = jsonb_set(
        "instantaneaSobreControlPrecios",
        ARRAY[$2],
        ("instantaneaSobreControlPrecios"->$2) - $3
          )
    WHERE
      "simulacionUID" = $1
    RETURNING
      "instantaneaSobreControlPrecios"->$2
      ;`;
    const parametros1 = [
      simulacionUID,
      fechaNoche,
      apartamentoIDV
    ]
    await conexion.query(consultaBorradoApartamento, parametros1);

    const consultaBorradoDiaSiVacio = `
      UPDATE "simulacionesDePrecio"
      SET "instantaneaSobreControlPrecios" = 
          CASE 
              WHEN jsonb_typeof("instantaneaSobreControlPrecios"->$2) = 'object' AND
                   "instantaneaSobreControlPrecios"->$2 = '{}'
              THEN "instantaneaSobreControlPrecios" - $2
              ELSE "instantaneaSobreControlPrecios"
          END
      WHERE "simulacionUID" = $1
      RETURNING "instantaneaSobreControlPrecios"->$2;
      `
    const parametros2 = [
      simulacionUID,
      fechaNoche,
    ]
    const resuelve = await conexion.query(consultaBorradoDiaSiVacio, parametros2);
    return resuelve.rows[0]
  } catch (errorCapturado) {
    throw errorCapturado
  }
}
