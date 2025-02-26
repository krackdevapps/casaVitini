import { conexion } from "../globales/db.mjs";

export const obtenerNombreComportamientoPorNombreUI = async (nombreDelComportamiento) => {

    try {
        const consulta = `
        SELECT *
        FROM "comportamientoPrecios"
        WHERE "nombreComportamiento" = $1
        `;
        const resuelve = await conexion.query(consulta, [nombreDelComportamiento]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}