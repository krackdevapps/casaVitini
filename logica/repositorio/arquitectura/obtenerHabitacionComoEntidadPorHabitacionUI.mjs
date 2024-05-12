import { conexion } from "../../componentes/db.mjs";

export const obtenerHabitacionComoEntidadPorHabitacionUI = async (habitacionUI) => {
    try {
        const consulta =  `
        SELECT
        *
        FROM habitaciones
        WHERE "habitacionUI" = $1`;
        const resuelve = await conexion.query(consulta, [habitacionUI]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}