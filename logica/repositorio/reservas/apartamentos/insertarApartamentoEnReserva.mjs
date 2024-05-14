import { conexion } from "../../../componentes/db.mjs"

export const insertarApartamentoEnReserva = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI

        const consulta = `
        INSERT INTO "reservaApartamentos"
        (
        "reservaUID",
        "apartamentoIDV",
        "apartamentoUI"
        )
        VALUES ($1, $2, $3) RETURNING "componenteUID"
        `;
        const parametros = [
            reservaUID,
            apartamentoIDV,
            apartamentoUI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el apartamento en la reserva"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

