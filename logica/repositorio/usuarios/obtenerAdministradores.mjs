import { conexion } from "../../componentes/db.mjs";

export const obtenerAdministradores = async (rolAdministrador) => {
    try {
        const consulta = `
        SELECT 
        rol
        FROM usuarios
        WHERE rol = $1;
        `;
        const resuelve = await conexion.query(consulta, [rolAdministrador]);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}