import { conexion } from "../../componentes/db.mjs";
export const eliminarClientePorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM clientes
        WHERE "testingVI" = $1
        RETURNING
        *;`;
        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
