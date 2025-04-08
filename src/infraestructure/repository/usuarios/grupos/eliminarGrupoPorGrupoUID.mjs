import { conexion } from "../../globales/db.mjs";

export const eliminarGrupoPorGrupoUID = async (grupoUID) => {
    try {
        const consulta = `
        DELETE FROM
        permisos.grupos
        WHERE
        "grupoUID" = $1
        RETURNING *;
          `;
        const controladores = await conexion.query(consulta, [grupoUID]);
        const r = controladores.rows[0]
        if (!r) {
            throw new Error("No se encuentra ninguna grupo con ese grupoUID")
        }
        return controladores.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}