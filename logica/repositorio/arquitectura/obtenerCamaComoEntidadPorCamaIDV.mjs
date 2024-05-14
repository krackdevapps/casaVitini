import { conexion } from "../../componentes/db.mjs";

export const obtenerCamaComoEntidadPorCamaIDV = async (camaIDV) => {
    try {

        const consulta = `
            SELECT
            *
            FROM camas
            WHERE "camaIDV" = $1;`;
        const resuelve = await conexion.query(consulta, [camaIDV])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }
}