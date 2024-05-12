import { conexion } from "../../componentes/db.mjs";

export const obtenerCamaComoEntidadPorCamaIDV = async (habitacionUID) => {
    try {

        const consulta = `
            SELECT
            *
            FROM camas
            WHERE cama = $1;`;
        const resuelve = await conexion.query(consulta, [habitacionUID])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        const error = "Error en el adaptador obtenerCamasPorHabitacion"
        throw new Error(error)
    }

}