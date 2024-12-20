import { conexion } from "../globales/db.mjs";

export const obtenerIDX = async (usuarioIDX) => {

    try {
        const consulta = `
        SELECT 
        *
        FROM usuarios
        WHERE usuario = $1;
        `;
        const resuelve = await conexion.query(consulta, [usuarioIDX])
        if (resuelve.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
