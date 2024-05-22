import { conexion } from "../../componentes/db.mjs";

export const actualizarRol = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const nuevoRol = data.nuevoRol
    try {
        const consulta = `
        UPDATE
        usuarios
        SET
        rol = $1
        WHERE
        usuario = $2;
        `;
        const parametros = [
            nuevoRol,
            usuarioIDX
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw error;
    }
};
