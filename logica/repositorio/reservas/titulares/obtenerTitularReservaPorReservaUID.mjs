import { conexion } from "../../../componentes/db.mjs";
export const obtenerTitularReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaTitulares"
        WHERE 
        "reservaUID" = $1;`;

        const resuelve = await conexion.query(consulta, [reservaUID])
        if (resuelve.rowCount === 0) {
            const error = "Esta reserva no tiene ningun titular asignado";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
