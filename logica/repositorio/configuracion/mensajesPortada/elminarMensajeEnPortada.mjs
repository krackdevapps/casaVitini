import { conexion } from "../../../componentes/db.mjs"

export const eliminarMensajeEnPortada = async (mensajeUID) => {
    try {
        const consulta = `
        DELETE FROM "mensajesEnPortada"
        WHERE "mensajeUID" = $1;
        `;

        const resuelve = await conexion.query(consulta, [mensajeUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
