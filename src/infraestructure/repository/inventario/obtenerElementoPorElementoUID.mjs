import { conexion } from "../globales/db.mjs";

export const obtenerElementoPorElementoUID = async (data) => {
    try {

        const elementoUID = data.elementoUID
        const errorSi = data.errorSi
        const consulta = `
        SELECT
        *
        FROM
        "inventarioGeneral"
        WHERE
        "UID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [elementoUID]);

        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No existe ningún elemento en el inventario con ese elemenotUID."
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un elemento en el inventario con ele elementoUID"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "El adaptador obtenerElementoPorElementoUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }

}