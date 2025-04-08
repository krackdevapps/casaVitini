import { conexion } from "../../globales/db.mjs";

export const eliminarUsuarioDelGrupoPorGrupoUIDPorUsuario = async (data) => {
    try {
        const usuario = data.usuario
        const grupoUID = data.grupoUID
        const consulta = `
        DELETE FROM
        permisos."usuariosEnGrupos"
        WHERE
        "grupoUID" = $1
        AND
        usuario = $2
        RETURNING *;
          `;

        const p = [
            grupoUID,
            usuario
        ]
        const controladores = await conexion.query(consulta, p);
        const r = controladores.rows[0]
        if (!r) {
            throw new Error("No se encuentra el usuario en el grupo")
        }
        return controladores.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}