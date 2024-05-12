import { conexion } from '../../componentes/db.mjs';
export const obtenerNombreHabitacionUI = async (habitacionIDV) => {
    try {
        const consulta = `
        SELECT "habitacionUI"
        FROM habitaciones 
        WHERE habitacion = $1;`
        const resolucionNombre = await conexion.query(consulta, [habitacionIDV])
        return resolucionNombre.rows[0].habitacionUI
    } catch (error) {
        throw error
    }
}
