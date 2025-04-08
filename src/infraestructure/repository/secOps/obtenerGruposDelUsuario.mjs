import { conexion } from "../globales/db.mjs";

export const obtenerGruposDelUsuario = async (usuario) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos."usuariosEnGrupos"
        WHERE
        usuario = $1;
        `;
        const resuelve = await conexion.query(consulta, [usuario]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}