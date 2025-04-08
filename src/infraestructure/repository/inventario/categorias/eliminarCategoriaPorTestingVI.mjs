import { conexion } from "../../globales/db.mjs";

export const eliminarCategoriaPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM public."inventarioCategorias"
        WHERE "testingVI" = $1
        RETURNING
        *;`;
        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
