import { conexion } from "../../componentes/db.mjs";
export const obtenerServiciosPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaServicios" 
        WHERE 
        "reservaUID" = $1`;
        const resuelve = await conexion.query(consulta, [reservaUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
