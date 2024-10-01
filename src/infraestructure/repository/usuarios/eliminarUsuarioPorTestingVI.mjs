import { conexion } from "../globales/db.mjs";

export const eliminarUsuarioPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM usuarios
        WHERE "testingVI" = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
