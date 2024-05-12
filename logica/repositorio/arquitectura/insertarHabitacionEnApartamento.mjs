import { conexion } from "../../componentes/db.mjs";

export const insertarHabitacionEnApartamento = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const habitacionIDV = data.habitacionIDV

        const consulta = `
        INSERT INTO "configuracionHabitacionesDelApartamento"
        (
        apartamento,
        habitacion
        )
        VALUES ($1, $2) RETURNING *
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV, habitacionIDV])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}