import { conexion } from "../../globales/db.mjs";

export const obtenerGrupoPorPermisoUIDControlador = async (permisoUID) => {
    try {
        const consulta = `
           SELECT 
           *
          FROM
            permisos."permisosControladoresPorGrupos"
          WHERE
            uid = $1
          `
            ;

        const controladores = await conexion.query(consulta, [permisoUID]);
        const r = controladores.rows[0]
        if (!r) {
            throw new Error("No se encuentra ningun permiso con ese permisoUID ")
        }
        return r
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}