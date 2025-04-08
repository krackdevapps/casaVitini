import { conexion } from "../../../globales/db.mjs";

export const obtenerUltimasRevisionesPorUsuario = async (usuario) => {
   
    try {
        
        const consulta = `
        SELECT
        *,
        (
        SELECT "apartamentoUI"
        FROM "apartamentos"
        WHERE
        protocolos."revisionAlojamiento"."apartamentoIDV" = public.apartamentos."apartamentoIDV"
        ) AS "apartamentoUI"
        FROM
        protocolos."revisionAlojamiento"
        WHERE
        usuario = $1
        ORDER BY 
        "estadoRevision" = 'enCurso' DESC, 
        "estadoRevision" = 'finalizada' DESC,
        "fechaFin" DESC
        LIMIT 5;
        `;
        
        const resuelve = await conexion.query(consulta, [usuario]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}