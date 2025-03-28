import { conexion } from "../../../../globales/db.mjs";

export const obtenerTareaPorUID = async (uid) => {
    try {
        const consulta = `
        SELECT
        *
        FROM
        protocolos."tareasAlojamiento"
        WHERE
        uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}