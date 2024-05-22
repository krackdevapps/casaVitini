import { conexion } from "../../../componentes/db.mjs";
export const obtenerTitularPoolReservaPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "poolTitularesReserva"
        WHERE 
        "reservaUID" = $1;`;

        const resuelve = await conexion.query(consulta, [reservaUID])
        if (resuelve.rowCount === 0) {
            const error = "Esta reserva no tiene ningun titular asignado";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
