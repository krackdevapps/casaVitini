import { conexion } from "../globales/db.mjs";
export const eliminarServiciosPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM servicios
        WHERE "testingVI" = $1
        RETURNING
        *;`;
        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
