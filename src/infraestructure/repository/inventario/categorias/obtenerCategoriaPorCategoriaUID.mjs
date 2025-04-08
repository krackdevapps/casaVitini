import { conexion } from "../../globales/db.mjs";

export const obtenerCategoriaPorCategoriaUID = async (data) => {
    try {
        const categoriaUID = data.categoriaUID
        const errorSi = data.errorSi

        const consulta = `
        SELECT
        *
        FROM
        "inventarioCategorias"
        WHERE
        "categoriaUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [categoriaUID]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = `No se encuentra ningún registro con ese registroUID`
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un registro con ese registroUID"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerCategoriaPorCategoriaUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }

}