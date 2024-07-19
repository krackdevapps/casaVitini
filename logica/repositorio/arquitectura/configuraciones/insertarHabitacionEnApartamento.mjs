import { conexion } from "../../../componentes/db.mjs";

export const insertarHabitacionEnApartamento = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const habitacionIDV = data.habitacionIDV

        const consulta = `
        INSERT INTO 
        "configuracionHabitacionesDelApartamento"
        (
        "apartamentoIDV",
        "habitacionIDV"
        )
        VALUES ($1, $2) 
        RETURNING *
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV, habitacionIDV])
        if (resuelve.rowCount === 0) {
            const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`;
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}