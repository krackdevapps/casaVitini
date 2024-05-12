import { conexion } from "../../componentes/db.mjs";

export const obtenerHabitacionComoEntidadPorHabitacionIDV = async (habitacionIDV) => {
    try {
        const consulta =  `
        SELECT
        *
        FROM habitaciones
        WHERE habitacion = $1;`;
        const resuelve = await conexion.query(consulta, [habitacionIDV]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}