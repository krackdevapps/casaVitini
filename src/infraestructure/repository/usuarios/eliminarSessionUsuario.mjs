import { conexion } from "../globales/db.mjs";

export const eliminarSessionUsuario = async (usuarioIDX) => {
    try {
        const consulta = `
        DELETE FROM 
        sessiones
        WHERE 
        sess->> 'usuario' = $1;
        `;
        await conexion.query(consulta, [usuarioIDX])
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};