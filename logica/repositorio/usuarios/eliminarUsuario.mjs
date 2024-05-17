import { conexion } from "../../componentes/db.mjs";

export const eliminarUsuario = async (usuarioIDX) => {
    try {
        const consulta = `
        DELETE FROM usuarios
        WHERE usuario = $1;
        `;
        const resuelve = await conexion.query(consulta, [usuarioIDX])
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el usuario";
            throw new Error(error);
        }
    } catch (error) {
        throw error;
    }
};
