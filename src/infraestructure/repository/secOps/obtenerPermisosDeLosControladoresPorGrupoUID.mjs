import { conexion } from "../globales/db.mjs";

export const obtenerPermisosDeLosControladoresPorGrupoUID = async (grupoUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
            permisos."permisosControladoresPorGrupos"
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