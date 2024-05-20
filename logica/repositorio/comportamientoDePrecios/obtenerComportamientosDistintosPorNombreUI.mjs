import { conexion } from "../../componentes/db.mjs";

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
        uid <> $2
        `
        const parametros = {
            nombreComportamiento: nombreComportamiento,
            comportamientoUID: comportamientoUID
        }
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}