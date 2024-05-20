import { conexion } from "../../../componentes/db.mjs"

export const obtenerPagosPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
        SELECT
        *
        FROM 
        "reservaPagos"
        WHERE 
        "reservaUID" = $1`;

        const resuelve = await conexion.query(consulta, [reservaUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún pago con ese reservaUID";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

