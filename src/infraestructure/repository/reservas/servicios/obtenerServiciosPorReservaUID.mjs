import { conexion } from "../../globales/db.mjs";
export const obtenerServiciosPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaServicios" 
        WHERE 
        "reservaUID" = $1
        ORDER BY "servicioUID" ASC`;
        const resuelve = await conexion.query(consulta, [reservaUID])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
