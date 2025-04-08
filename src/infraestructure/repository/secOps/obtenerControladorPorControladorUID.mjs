import { conexion } from "../globales/db.mjs";

export const obtenerControladorPorControladorUID = async (uid) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.controladores
        WHERE
        "controladorUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}