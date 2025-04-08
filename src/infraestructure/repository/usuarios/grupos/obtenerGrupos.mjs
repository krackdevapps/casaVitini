import { conexion } from "../../globales/db.mjs";

export const obtenerGrupos = async () => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.grupos
        `;
        const resuelve = await conexion.query(consulta);
        const grupo = resuelve.rows
        return grupo
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}