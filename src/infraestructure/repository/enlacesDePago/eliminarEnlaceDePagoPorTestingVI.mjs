import { conexion } from "../globales/db.mjs";

export const eliminarEnlaceDePagoPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM "enlacesDePago"
        WHERE "testingVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

