import { conexion } from "../../../componentes/db.mjs"

export const elminarMensajeEnPortadaPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM "mensajesEnPortada"
        WHERE "testingVI" = $1;
        `;

        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
