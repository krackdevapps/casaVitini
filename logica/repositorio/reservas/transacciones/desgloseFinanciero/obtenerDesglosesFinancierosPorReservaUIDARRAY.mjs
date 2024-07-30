import { conexion } from "../../../../componentes/db.mjs";
export const obtenerDesglosesFinancierosPorReservaUIDARRAY = async (reservaUIDArray) => {
    try {
        const consulta = `
        SELECT
            *
        FROM 
            "reservaFinanciero"
        WHERE 
            "reservaUID" = ANY($1)`;
        const resuelve = await conexion.query(consulta, [reservaUIDArray]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}