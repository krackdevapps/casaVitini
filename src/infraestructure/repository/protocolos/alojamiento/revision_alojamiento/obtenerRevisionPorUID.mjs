import { conexion } from "../../../globales/db.mjs";

export const obtenerRevisionPorUID = async (uid) => {
   
    try {
        
        const consulta = `
        SELECT
        *
        FROM
        protocolos."revisionAlojamiento"
        WHERE
        uid = $1;
        `;
        
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}