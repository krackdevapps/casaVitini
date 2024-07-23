import { conexion } from "../../componentes/db.mjs";

export const eliminarTodasLasSessionesMenosPorUsuario = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const sessionIDX = data.sessionIDX
    try {
        const consulta = `
        DELETE FROM sessiones
        WHERE sid <> $1 AND sess->> 'usuario' = $2;
        `;
        const parametros = [
            sessionIDX,
            usuarioIDX
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
