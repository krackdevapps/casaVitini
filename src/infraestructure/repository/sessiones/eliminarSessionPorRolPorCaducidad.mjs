import { conexion } from "../globales/db.mjs";
export const eliminarSessionPorRolPorCaducidad = async () => {
    try {


        const consultaCuentaAntiguas = `
        DELETE FROM usuarios
        WHERE "ultimoLogin" < NOW() - interval '6 months'
        AND NOT EXISTS (
              SELECT 1
              FROM permisos."usuariosEnGrupos"
              WHERE permisos."usuariosEnGrupos".usuario = usuarios.usuario
        );

  `;
        await conexion.query(consultaCuentaAntiguas);
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}