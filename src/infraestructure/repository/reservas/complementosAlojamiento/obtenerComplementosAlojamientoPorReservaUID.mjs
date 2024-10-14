import { conexion } from "../../globales/db.mjs";
export const obtenerComplementosAlojamientoPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaComplementosAlojamiento" 
        WHERE 
        "reservaUID" = $1`;
        const resuelve = await conexion.query(consulta, [reservaUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
