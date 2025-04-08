import { conexion } from "../../globales/db.mjs";

export const actualizarNombreCategoriaPorCategoriaUID = async (data) => {
    try {
        const categoriaUID = data.categoriaUID
        const categoriaUI = data.categoriaUI
        const descripcion = data.descripcion

        const consulta = `
        UPDATE "inventarioCategorias"
        SET 
        "categoriaUI" = $1,
        descripcion = $2
        WHERE "categoriaUID" = $3
        RETURNING
        *
        `;

        const parametros = [
            categoriaUI,
            descripcion,
            categoriaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe la categorai revisa el categoriaUID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}