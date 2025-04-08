import { conexion } from "../globales/db.mjs";

export const obtenerPermisosDeLasVistasPorGrupoUID = async (grupoUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
            permisos."permisosVistasPorGrupos"
        WHERE
        "grupoUID" = $1
            ;
        `;
        const resuelve = await conexion.query(consulta, [grupoUID]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}