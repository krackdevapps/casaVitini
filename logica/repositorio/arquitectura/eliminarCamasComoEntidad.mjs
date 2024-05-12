import { conexion } from "../../componentes/db.mjs";

export const eliminarCamasComoEntidad = async (data) => {

    const habitacionUID = data.habitacionUID
    const camaIDV = data.camaIDV

    try {
        const consulta = `
        INSERT INTO "configuracionCamasEnHabitacion"
        (
        habitacion,
        cama
        )
        VALUES ($1, $2)
        `;
        const resuelve = await conexion.query(consulta, [habitacionUID, camaIDV]);
        return resuelve 
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}