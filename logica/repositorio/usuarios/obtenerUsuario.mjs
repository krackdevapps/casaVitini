import { conexion } from "../../componentes/db.mjs";

export const obtenerUsuario = async (usuario) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM usuarios
        WHERE usuario = $1;
        `;

        const resuelve = await conexion.query(consulta, [usuario]);
        if (resuelve.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}