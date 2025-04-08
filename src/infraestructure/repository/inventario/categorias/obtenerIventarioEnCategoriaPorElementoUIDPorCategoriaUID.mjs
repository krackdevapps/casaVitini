import { conexion } from "../../globales/db.mjs";

export const obtenerIventarioEnCategoriaPorElementoUIDPorCategoriaUID = async (data) => {
    try {
        const categoriaUID = data.categoriaUID
        const elementoUID = data.elementoUID
        const errorSi = data.errorSi

        const consulta = `
        SELECT
        *
        FROM
        public."inventarioElementosEnCategorias"
        WHERE
        "categoriaUID" = $1
        AND
        "elementoUID" = $2;
        `;
        const p = [
            categoriaUID,
            elementoUID
        ]
        const resuelve = await conexion.query(consulta, p);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = `No se encuentra el elemento en la categoria`
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe el elemento en la categoria"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerIventarioEnCategoriaPorElementoUIDPorCategoriaUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }

}