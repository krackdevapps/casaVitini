import { conexion } from "../../componentes/db.mjs";

export const obtenerUsuarioPorCodigoVerificacion = async (codigo) => {
    try {
        const consulta =`
        SELECT
        "codigoVerificacion"
        FROM usuarios
        WHERE "codigoVerificacion" = $1;`;

        const resuelve = await conexion.query(consulta, [codigo]);
 resuelve.rows
    } catch (error) {
        throw error
    }
}