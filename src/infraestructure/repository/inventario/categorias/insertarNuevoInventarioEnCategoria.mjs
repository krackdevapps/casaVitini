import { conexion } from "../../globales/db.mjs";

export const insertarNuevoInventarioEnCategoria = async (data) => {
    try {
        const categoriaUID = data.categoriaUID
        const elementoUID = data.elementoUID

        const consulta = `
        INSERT INTO public."inventarioElementosEnCategorias"
        (
        "categoriaUID",
        "elementoUID"
        )
        VALUES ($1, $2)
        RETURNING *
        `;
        const parametros = [
            categoriaUID,
            elementoUID,

        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el elemento en la categoria"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}