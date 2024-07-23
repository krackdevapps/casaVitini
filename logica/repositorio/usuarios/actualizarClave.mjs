import { conexion } from "../../componentes/db.mjs";

export const actualizarClave = async (data) => {

    const hashCreado = data.hashCreado
    const nuevaSal = data.nuevaSal
    const usuarioIDX = data.usuarioIDX

    try {
        const consulta = `
        UPDATE usuarios
        SET 
            clave = $1,
            sal = $2
        WHERE 
            usuario = $3
        `;
        const parametros = [
            hashCreado,
            nuevaSal,
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
