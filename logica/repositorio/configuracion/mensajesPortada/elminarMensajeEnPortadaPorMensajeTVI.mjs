import { conexion } from "../../../componentes/db.mjs"

export const eliminarMensajeEnPortadaPorMensajeTVI = async (mensajeTVI) => {
    try {
        const consulta = `
        DELETE FROM "mensajesEnPortada"
        WHERE "mensajeTVI" = $1;
        `;

        const resuelve = await conexion.query(consulta, [mensajeTVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
