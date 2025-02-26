import { conexion } from "../globales/db.mjs";

export const eliminarImpuestoPorImpuestoUID = async (impuestoUID) => {
    try {
        const consulta = `
        DELETE FROM impuestos
        WHERE "impuestoUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [impuestoUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}