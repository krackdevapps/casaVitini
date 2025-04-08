import { conexion } from "../../globales/db.mjs";

export const insertarNuevaCategoria = async (data) => {
    try {
        const categoriaUI = data.categoriaUI
        const testingVI = data.testingVI

        const consulta = `
        INSERT INTO "inventarioCategorias"
        (
        "categoriaUI",
        "testingVI"
        )
        VALUES ($1, $2)
        RETURNING *
        `;
        const parametros = [
            categoriaUI,
            testingVI
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la categoria en el inventario."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}