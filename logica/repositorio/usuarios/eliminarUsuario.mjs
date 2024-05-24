import { conexion } from "../../componentes/db.mjs";

export const eliminarUsuario = async (usuarioIDX) => {
    try {
        const consulta = `
        DELETE FROM usuarios
        WHERE usuario = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [usuarioIDX])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
