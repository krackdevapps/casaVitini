import { conexion } from "../../../globales/db.mjs";

export const obtenerRevisionEnCursoPorApartamentoIDV = async (apartamentoIDV) => {
   
    try {
        
        const consulta = `
        SELECT
        *
        FROM
        protocolos."revisionAlojamiento"
        WHERE
        "apartamentoIDV" = $1
        AND
        "estadoRevision" = 'enCurso'
        `;
        
        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}