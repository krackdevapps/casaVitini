import { conexion } from "../globales/db.mjs";

export const obtenerAdministradores = async (rolAdministrador) => {
    try {
        const consulta = `
        SELECT 
        "rolIDV"
        FROM usuarios
        WHERE "rolIDV" = $1;
        `;
        const resuelve = await conexion.query(consulta, [rolAdministrador]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}