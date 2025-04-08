import { conexion } from "../../globales/db.mjs";

export const eliminarCategoriaPorCategoriaUID = async (uid) => {
    try {
        const consulta = `
        DELETE FROM "inventarioCategorias"
        WHERE "categoriaUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}