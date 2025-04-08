import { conexion } from "../globales/db.mjs";

export const obtenerPermisosDeLosGruposDeLaVista = async (data) => {
    try {
        const vistaUID = data.vistaUID
        const gruposUIDArray = data.gruposUIDArray

        const consulta = `
        SELECT 
        *
        FROM
            permisos."permisosVistasPorGrupos"
        WHERE
        "vistaUID" = $1
        AND
        "grupoUID" = ANY($2::bigInt[]);
            ;
        `;
        const p = [
            vistaUID,
            gruposUIDArray
        ]
        const resuelve = await conexion.query(consulta, p);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}