import { conexion } from "../../../globales/db.mjs";
export const eliminarSobreControlDia = async (data) => {
  try {
    const reservaUID = data.reservaUID
    const fechaNoche = data.fechaNoche
    const consulta = `
      UPDATE
      "reservaFinanciero"
      SET
      "instantaneaSobreControlPrecios" = "instantaneaSobreControlPrecios" - $2
      WHERE
      "reservaUID" = $1;`;
    const parametros = [
      reservaUID,
      fechaNoche
    ]
    const resuelve = await conexion.query(consulta, parametros);
    return resuelve.rows[0]
  } catch (errorCapturado) {
    throw errorCapturado
  }
}

