import { conexion } from "../../../componentes/db.mjs"

export const obtenerApartamentosDeLaReservaPorApartamentoIDV = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const apartamentoIDV=data.apartamentoIDV

        const consulta = `
        SELECT 
        "apartamentoIDV"
        FROM "reservaApartamentos"
        WHERE "reservaUID" = $1 AND "apartamentoIDV" = $2
        `;
        const parametros = [
            reservaUID,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, [parametros]);
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

