import { conexion } from "../../../componentes/db.mjs"

export const obtenerApartamentoDeLaReservaPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM "reservaApartamentos"
        WHERE 
        "apartamentoIDV" = $1
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe el apartamentoIDV en ninguna reserva."
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

