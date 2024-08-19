import { conexion } from "../../componentes/db.mjs";

export const eliminarImpuestoPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM impuestos
        WHERE "testingVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}