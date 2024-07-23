import { conexion } from "../../componentes/db.mjs";

export const obtenerUsuario = async (data) => {
    try {
        const usuario = data.usuario
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM usuarios
        WHERE usuario = $1;
        `;

        const resuelve = await conexion.query(consulta, [usuario]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe el usuario";
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un usuario con ese nombre de usuario";
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerUsuario necesita errorSi en existe, noExiste o desactivado"
           throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}