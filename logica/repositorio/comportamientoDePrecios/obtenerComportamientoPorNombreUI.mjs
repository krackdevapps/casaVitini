import { conexion } from "../../componentes/db.mjs";

export const obtenerNombreComportamientoPorNombreUI = async (nombreDelComportamiento) => {

    try {
        const consulta =  `
        SELECT "nombreComportamiento"
        FROM "comportamientoPrecios"
        WHERE "nombreComportamiento" = $1
        `;
        const resuelve = await conexion.query(consulta, [nombreDelComportamiento]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}