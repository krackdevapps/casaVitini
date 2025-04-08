import { conexion } from "../../globales/db.mjs";

export const actualizarPermisosVistaPorPermisoUID = async (data) => {
    try {
        const permisoUID = data.permisoUID
        const permisoIDV = data.permisoIDV
        const consulta = `
        UPDATE
            permisos."permisosVistasPorGrupos"
        SET 
            permiso = $1
        WHERE 
            uid = $2
        RETURNING
            *
          `
            ;
        const p = [
            permisoIDV,
            permisoUID
        ]
        const controladores = await conexion.query(consulta, p);
        const r = controladores.rows[0]
        if (!r) {
            throw new Error("No se encuentra ningun permiso con ese permisoUID ")
        }
        return r
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}