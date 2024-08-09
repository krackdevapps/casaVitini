import { conexion } from "../../../componentes/db.mjs";
export const actualizarSobreControlDeLaNoche = async (data) => {
  try {
    const simulacionUID = data.simulacionUID
    const fechaNoche = data.fechaNoche
    const apartamentoIDV = data.apartamentoIDV
    const nuevoSobreControl = data.nuevoSobreControl
    const consulta = `
      UPDATE "simulacionesDePrecio"
      SET "instantaneaSobreControlPrecios" = 
          CASE 
              WHEN "instantaneaSobreControlPrecios" ? $2
              THEN jsonb_set(
                  "instantaneaSobreControlPrecios",
                  ARRAY[$2, $3],
                  $4::jsonb,
                  true
              )
              ELSE jsonb_set(
                  COALESCE("instantaneaSobreControlPrecios", '{}'::jsonb),
                  ARRAY[$2],
                  jsonb_set('{}'::jsonb, ARRAY[$3], to_jsonb($4)),
                  true
              )
          END
      WHERE "simulacionUID" = $1
      RETURNING "instantaneaSobreControlPrecios"->$2->$3 AS "sobreControl";`;


    const parametros = [
      simulacionUID,
      fechaNoche,
      apartamentoIDV,
      nuevoSobreControl
    ]
    const resuelve = await conexion.query(consulta, parametros);
    return resuelve.rows[0]
  } catch (errorCapturado) {
    throw errorCapturado
  }
}

