import { conexion } from "../../globales/db.mjs";

export const obtenerCategoriasDelElementoPorElementoUID = async (data) => {
    try {
        const elementoUID = data.elementoUID
        const errorSi = data.errorSi

        const consulta = `
        SELECT
        *,
        (
           SELECT "categoriaUI" FROM public."inventarioCategorias"
           WHERE
           public."inventarioElementosEnCategorias"."categoriaUID" = public."inventarioCategorias"."categoriaUID"
        ) AS "categoriaUI"
        FROM
        public."inventarioElementosEnCategorias"
        WHERE
        "elementoUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [elementoUID]);
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = `No se encuentra ningún registro con ese registroUID`
                throw new Error(error)
            }
            return resuelve.rows

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un registro con ese registroUID"
                throw new Error(error)
            }
            return resuelve.rows
        } else if (errorSi === "desactivado") {
            return resuelve.rows
        } else {
            const error = "El adaptador obtenerCategoriasDelElementoPorElementoUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }

}