import { conexion } from "../../../globales/db.mjs";

export const eliminarRevisionPorRevisionUID = async (uid) => {
    try {
        const consulta = `
        DELETE FROM protocolos."revisionAlojamiento"
        WHERE uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}