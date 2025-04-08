import { conexion } from "../../../globales/db.mjs";

export const obtenerFechaPostPuestaPorApartamentoIDV = async (apartamentoIDV) => {
    try {

        const consulta = `
        SELECT
        *
        FROM
        protocolos."fechasPostPuestasParaRevision"
        WHERE
        "apartamentoIDV" = $1
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}