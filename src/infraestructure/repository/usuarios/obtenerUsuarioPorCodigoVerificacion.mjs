import { conexion } from "../globales/db.mjs";

export const obtenerUsuarioPorCodigoVerificacion = async (codigo) => {
    try {
        const consulta = `
        SELECT
        "codigoVerificacion"
        FROM usuarios
        WHERE "codigoVerificacion" = $1;`;

        const resuelve = await conexion.query(consulta, [codigo]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}