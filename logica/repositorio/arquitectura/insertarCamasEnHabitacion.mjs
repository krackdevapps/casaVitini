import { conexion } from "../../componentes/db.mjs";

export const insertarCamaEnHabitacion = async (data) => {

    const habitacionUID = data.habitacionUID
    const camaIDV = data.camaIDV

    try {
        const consulta = `
        INSERT INTO "configuracionCamasEnHabitacion"
        (
        habitacion,
        cama
        )
        VALUES ($1, $2) RETURNING uid
        `;
        await conexion.query(consulta, [habitacionUID, camaIDV]);
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}