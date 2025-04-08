import { conexion } from "../globales/db.mjs";

export const obtenerPermisosDeLosGruposDeLosControladores = async (data) => {
    try {
        const controladorUID = data.controladorUID
        const gruposUIDArray = data.gruposUIDArray

        const consulta = `
        SELECT 
        *
        FROM
         permisos."permisosControladoresPorGrupos"
        WHERE
        "controladorUID" = $1
        AND
        "grupoUID" = ANY($2::bigInt[]);
            ;
        `;
        const p = [
            controladorUID,
            gruposUIDArray
        ]
        const resuelve = await conexion.query(consulta, p);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}