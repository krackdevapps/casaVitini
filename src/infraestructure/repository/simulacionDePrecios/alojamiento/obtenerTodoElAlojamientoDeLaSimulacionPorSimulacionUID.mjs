import { conexion } from "../../globales/db.mjs";

export const obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID = async (simulacionUID) => {
    try {
        const consulta = `
        SELECT
        *
        FROM
        "simulacionesDePrecioAlojamiento"
        WHERE
        "simulacionUID" = $1
        `;
        const resuelve = await conexion.query(consulta, [simulacionUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
