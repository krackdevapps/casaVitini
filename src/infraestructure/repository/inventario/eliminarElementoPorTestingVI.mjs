import { conexion } from "../globales/db.mjs";

export const eliminarElementoPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM public."inventarioGeneral"
        WHERE "testingVI" = $1
        RETURNING
        *;`;
        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
