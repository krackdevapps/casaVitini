import { conexion } from "../../../globales/db.mjs";

export const obtenerUsuariosUnicosConRevisiones = async () => {
   
    try {
        
        const consulta = `
        SELECT DISTINCT usuario
        FROM
        protocolos."revisionAlojamiento";
        `;
        
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}