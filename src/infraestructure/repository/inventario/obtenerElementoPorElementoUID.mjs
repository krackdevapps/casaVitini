import { conexion } from "../globales/db.mjs";

export const obtenerElementoPorElementoUID = async (elementoUID) => {
    try {
        const consulta = `
        SELECT
        *
        FROM
        "inventarioGeneral"
        WHERE
        "UID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [elementoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún elemento en el inventario con ese elemenotUID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}