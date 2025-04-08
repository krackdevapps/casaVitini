import { conexion } from "../globales/db.mjs";

export const obtenerVistaPorVistaUID = async (uid) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.vistas
        WHERE
        "vistaUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}