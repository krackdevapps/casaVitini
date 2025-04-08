import { conexion } from "../../globales/db.mjs";

export const eliminarGrupoPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM
        permisos.grupos
        WHERE
        "testingVI" = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
