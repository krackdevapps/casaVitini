import { conexion } from "../../../componentes/db.mjs"

export const obtenerHabitacionesDelApartamento = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const apartamentoUID = data.apartamentoUID

        const consulta = `
        SELECT 
        *
        FROM
        "reservaHabitaciones"
        WHERE
        "reservaUID" = $1
        AND
        "apartamentoUID" = $2 ; 
        `;
        const parametros = [
            reservaUID,
            apartamentoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

