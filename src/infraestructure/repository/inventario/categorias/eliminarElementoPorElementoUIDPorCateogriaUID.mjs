import { conexion } from "../../globales/db.mjs";

export const eliminarElementoPorElementoUIDPorCateogriaUID = async (data) => {
    try {

        const elementoUID = data.elementoUID
        const categoriaUID = data.categoriaUID


        const consulta = `
        DELETE FROM public."inventarioElementosEnCategorias"
        WHERE
        "categoriaUID" = $1
        AND
        "elementoUID" = $2
        RETURNING *;
        `;
        const p = [
            categoriaUID,
            elementoUID,
        ]
        const resuelve = await conexion.query(consulta, p);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}