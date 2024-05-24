import { conexion } from "../../componentes/db.mjs";
export const eliminarComportamientoPorComportamientoUID = async (comportamientoUID) => {
    try {

        const consulta = `
        DELETE FROM "comportamientoPrecios"
        WHERE "comportamientoUID" = $1
        RETURNING *;
        `;
        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
