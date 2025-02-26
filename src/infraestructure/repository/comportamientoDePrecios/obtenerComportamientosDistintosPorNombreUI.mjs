import { conexion } from "../globales/db.mjs";

export const obtenerComportamientosDistintosPorNombreUI = async (data) => {

    try {

        const nombreComportamiento = data.nombreComportamiento
        const comportamientoUID = data.comportamientoUID

        const consulta = `
        SELECT *
        FROM "comportamientoPrecios"
        WHERE 
        lower("nombreComportamiento") = lower($1)
        AND
        "comportamientoUID" <> $2
        `
        const parametros = [
            nombreComportamiento,
            comportamientoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}