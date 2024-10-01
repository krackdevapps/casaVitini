import { conexion } from "../../globales/db.mjs"

export const obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        SELECT 
        *
        FROM "reservaApartamentos"
        WHERE 
        "reservaUID" = $1
        AND 
        "apartamentoIDV" = $2
        `;
        const parametros = [
            reservaUID,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

