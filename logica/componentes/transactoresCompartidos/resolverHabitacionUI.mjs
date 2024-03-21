import { conexion } from '../db.mjs';
const resolverHabitacionUI = async (habitacionIDV) => {
    try {
        const resolucionNombre = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV])
        if (resolucionNombre.rowCount === 0) {
            const error = "No existe el identificador de la habitacionIDV"
            throw new Error(error)
        }
        return resolucionNombre.rows[0].habitacionUI
    } catch (error) {
        throw error;
    }

}
export {
    resolverHabitacionUI
}