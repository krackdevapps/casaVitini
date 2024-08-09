import { conexion } from "../../../../componentes/db.mjs"
export const obtenerTodasLasHabitaciones = async () => {
    try {
        const consulta =`
        SELECT *
        FROM habitaciones;`
        const resolucionNombre = await conexion.query(consulta)
        return resolucionNombre.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
