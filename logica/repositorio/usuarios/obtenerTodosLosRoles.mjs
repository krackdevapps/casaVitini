import { conexion } from "../../componentes/db.mjs";

export const obtenerTodosLosRoles = async () => {
    try {
        const consulta =  `
        SELECT 
        "rolUI",
        "rolIDV"
        FROM "usuariosRoles"
        `;

        const resuelve = await conexion.query(consulta);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun rol";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (error) {
        throw error
    }
}