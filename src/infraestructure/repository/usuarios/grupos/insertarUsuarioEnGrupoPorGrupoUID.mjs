import { conexion } from "../../globales/db.mjs";

export const insertarUsuarioEnGrupoPorGrupoUID = async (data) => {
    try {
        const usuario = data.usuario
        const grupoUID = data.grupoUID

        const consulta = `
        INSERT INTO
        permisos."usuariosEnGrupos" ("grupoUID", usuario)
        VALUES
        ($1, $2)
        RETURNING *;
          `;

        const p = [
            grupoUID,
            usuario
        ]
        const controladores = await conexion.query(consulta, p);
        return controladores.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}