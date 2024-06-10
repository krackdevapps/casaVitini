
import { conexion } from "../../../componentes/db.mjs"

export const obtenerDesgloseFinancieroPorReservaUID = async (reservaUID) => {
    try {
        const consulta = `
            SELECT
            *
            FROM "reservaFinanciero"
            WHERE 
            "reservaUID" = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se puede obtener los totales de la reserva por que no se encuentra informacion financiero con ese reservaUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
