import { conexion } from "../../../globales/db.mjs";

export const eliminarRevisionPorUID = async (uid) => {
   
    try {
        
        const consulta = `
        DELETE FROM
        protocolos."revisionAlojamiento"
        WHERE uid = $1
        RETURNING *;
        `;
        
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}