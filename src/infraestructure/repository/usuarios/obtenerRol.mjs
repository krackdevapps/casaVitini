import { conexion } from "../globales/db.mjs";

export const obtenerRol = async (rolIDV) => {
    try {
        const consulta = `
        SELECT 
        "rolUI",
        "rolIDV"
        FROM "usuariosRoles"
        WHERE "rolIDV" = $1;
        `;

        const resuelve = await conexion.query(consulta, [rolIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe el identificador visual del rol";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}