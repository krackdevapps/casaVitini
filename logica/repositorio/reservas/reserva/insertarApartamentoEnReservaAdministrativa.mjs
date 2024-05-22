import { conexion } from "../../../componentes/db.mjs"

export const insertarApartamentoEnReservaAdministrativa = async (data) => {
    try {
        const reservaUIDNuevo = data.reservaUIDNuevo
        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI

        const consulta = `
        INSERT INTO
        "reservaApartamentos"
        (
        "reservaUID",
        "apartamentoIDV", 
        "apartamentoUI"
        )
        VALUES ($1, $2, $3)
        `;
        const parametros = [
            reservaUIDNuevo,
            apartamentoIDV,
            apartamentoUI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = `No se el ${apartamentoUI} (${apartamentoIDV}) en la reserva,por lo tanto no se ha podido crear la reserva.`;
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

