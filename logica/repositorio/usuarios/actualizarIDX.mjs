import { conexion } from "../../componentes/db.mjs";

export const actualizarIDX = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const nuevoIDX = data.nuevoIDX
    try {
        const consulta = `
        UPDATE usuarios
        SET 
            usuario = $2
        WHERE 
            usuario = $1
        RETURNING 
            usuario           
        `;
        const parametros = [
            usuarioIDX,
            nuevoIDX
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error;
    }
};
