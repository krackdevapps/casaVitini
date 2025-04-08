import { conexion } from "../../globales/db.mjs";

export const actualizarNombreGrupoPorGrupoUID = async (data) => {
    try {
        const grupoUI = data.grupoUI
        const grupoUID = data.grupoUID
        const consulta = `
        UPDATE
            permisos.grupos
        SET 
            "grupoUI" = $1
        WHERE 
            "grupoUID" = $2
        RETURNING
            *
          `
            ;
        const p = [
            grupoUI,
            grupoUID
        ]
        const controladores = await conexion.query(consulta, p);
        const r = controladores.rows[0]
        if (!r) {
            throw new Error("No se encuentra ningun grupo con ese grupoUID")
        }
        return r
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}