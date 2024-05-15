import { conexion } from "../../../componentes/db.mjs";

export const eliminarTitularPoolPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        DELETE FROM 
        "poolTitularesReserva"
        WHERE
        reserva = $1;
        `;
        const resuelve = await conexion.query(consulta, reservaUID)
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
