import { conexion } from "../../../../componentes/db.mjs";

export const obtenerInstantaneaImpuestosPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        "instantaneaInpuestos"
        FROM 
        "reservaFinanciero" 
        WHERE
        "reservaUID" = $1`
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

