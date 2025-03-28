import { conexion } from "../../../../globales/db.mjs";
export const obtenerTareaPorApartamentoIDV = async (apartamentoIDV) => {
    try {

        const consulta = `
        SELECT
        *
        FROM
        protocolos."tareasAlojamiento"
        WHERE
        "apartamentoIDV" = $1;
        `;
  
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}