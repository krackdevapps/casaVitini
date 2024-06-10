import { conexion } from "../../../componentes/db.mjs"

export const insertarHabitacionEnApartamento = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const apartamentoUID = data.apartamentoUID
        const habitacionUI = data.habitacionUI
        const habitacionIDV = data.habitacionIDV
        const consulta = `
        INSERT INTO "reservaHabitaciones"
        (
        "apartamentoUID",
        "habitacionIDV",
        "habitacionUI",
        "reservaUID"
        )
        VALUES ($1, $2, $3, $4) 
        RETURNING "componenteUID"
        `;
        const parametros = [
            apartamentoUID,
            habitacionIDV,
            habitacionUI,
            reservaUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido la habitacion en el apartamento de la reserva"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

