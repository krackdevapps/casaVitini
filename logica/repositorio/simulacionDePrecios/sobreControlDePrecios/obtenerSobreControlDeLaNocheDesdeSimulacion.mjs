import { conexion } from "../../../componentes/db.mjs";

export const obtenerSobreControlDeLaNocheDesdeSimulacion = async (data) => {
  try {
    const simulacionUID = data.simulacionUID
    const fechaNoche = data.fechaNoche
    const apartamentoIDV = data.apartamentoIDV

    const consulta = `
       SELECT
         "nochesSobreControl".key AS "fechaNoche",
         "detallesSobreControl" AS "detallesSobreControl"
       FROM
         "simulacionesDePrecio",
         jsonb_each("instantaneaSobreControlPrecios") AS "nochesSobreControl"(key, "apartamentosDeLaNoche"),
         jsonb_each("apartamentosDeLaNoche") AS apartamentos(apartamento_id, "detallesSobreControl")
       WHERE
         apartamento_id = $3
         AND
         "simulacionUID" = $1
         AND
         "nochesSobreControl".key = $2;
     `;
    const parametros = [
      simulacionUID,
      fechaNoche,
      apartamentoIDV
    ]
    const resuelve = await conexion.query(consulta, parametros)
    return resuelve.rows[0]

  } catch (errorCapturado) {
    throw errorCapturado
  }
}

