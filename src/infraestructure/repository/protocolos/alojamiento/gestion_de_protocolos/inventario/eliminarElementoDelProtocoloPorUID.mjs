import { conexion } from "../../../../globales/db.mjs";
export const eliminarElementoDelProtocoloPorUID = async (uid) => {
    try {
        const consulta = `
        DELETE FROM  protocolos."inventarioAlojamiento"
        WHERE uid = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}