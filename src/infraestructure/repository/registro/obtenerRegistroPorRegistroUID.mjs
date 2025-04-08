import { conexion } from "../globales/db.mjs";

export const obtenerRegistroPorRegistroUID = async (uid) => {
    try {
        const consulta = `
        SELECT
        *
        FROM
        registro.registros
        WHERE
        uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún registro con ese registroUID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}