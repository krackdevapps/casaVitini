import { conexion } from "../globales/db.mjs";
export const eliminarComportamientoDePrecioPorComportamientoUID = async (comportamientoUID) => {
    try {

        const consulta = `
        DELETE FROM "comportamientoPrecios"
        WHERE "comportamientoUID" = $1;
        `;

        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha encontrado ningún comportamiento de precio que eliminar.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
