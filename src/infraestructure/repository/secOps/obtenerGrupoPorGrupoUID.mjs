import { conexion } from "../globales/db.mjs";

export const obtenerGrupoPorGrupoUID = async (grupoUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.grupos
        WHERE
        "grupoUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [grupoUID]);
        const grupo = resuelve.rows[0]
        if (!grupo) {
            throw new Error("No existe ninguna grupo con ese grupoUID")
        }
        return grupo
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}