import { conexion } from "../../globales/db.mjs";

export const obtenerComplementoAlojamientoEnReservaPorComplementoUID = async (complementoUID_enReserva) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        "reservaComplementosAlojamiento" 
        WHERE 
        "complementoUID" = $1`;
        const resuelve = await conexion.query(consulta, [complementoUID_enReserva])
        if (resuelve.rowCount === 0) {
            const error = "No se ha encontrado el servicioUID dentro de la reserva"
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
