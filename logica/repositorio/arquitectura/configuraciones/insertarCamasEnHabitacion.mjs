import { conexion } from "../../../componentes/db.mjs";


export const insertarCamaEnHabitacion = async (data) => {

    const habitacionUID = data.habitacionUID
    const camaIDV = data.camaIDV

    try {
        const consulta = `
        INSERT INTO "configuracionCamasEnHabitacion"
        (
        "habitacionUID",
        "camaIDV"
        )
        VALUES ($1, $2)
        RETURNING *
        `;
        const resuelve = await conexion.query(consulta, [habitacionUID, camaIDV]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}