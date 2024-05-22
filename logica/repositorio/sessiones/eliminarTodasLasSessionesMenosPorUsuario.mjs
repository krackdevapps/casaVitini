import { conexion } from "../../componentes/db.mjs";

export const eliminarTodasLasSessionesMenosPorUsuario = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const sessionIDXActual = data.sessionIDXActual
    try {
        const consulta = `
        DELETE FROM sessiones
        WHERE sid != $1 AND sess->> 'usuario' = $2;
        `;
        const parametros = [
            sessionIDX,
            usuarioIDX
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe la session";
            throw new Error(error);
        }
    } catch (errorCapturado) {
        throw error;
    }
};
