import { conexion } from "../../globales/db.mjs";

export const obtenerUsuarioDelGrupo = async (data) => {
    try {
        const usuario = data.usuario
        const grupoUID = data.grupoUID

        const consulta = `
        SELECT 
        *
        FROM
        permisos."usuariosEnGrupos"
        WHERE
        usuario = $1
        AND
        "grupoUID" = $2
        `;
        const p = [
            usuario,
            grupoUID
        ]
        const resuelve = await conexion.query(consulta, p);
        const grupo = resuelve.rows[0]
        return grupo
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}