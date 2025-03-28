import { conexion } from "../../../globales/db.mjs";

export const obtenerRevisionPorApartamentoIDVPorEstado = async (data) => {
   
    try {
        const apartamentoIDV = data.apartamentoIDV
        const estadoRevision = data.estadoRevision

        const consulta = `
        SELECT
        *
        FROM
        protocolos."revisionAlojamiento"
        WHERE
        "apartamentoIDV" = $1
        AND
        "estadoRevision" = $2;
        `;

        const parametros = [
            apartamentoIDV,
            estadoRevision
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}