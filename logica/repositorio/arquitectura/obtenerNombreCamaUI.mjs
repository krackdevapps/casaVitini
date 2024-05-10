import { conexion } from "../../componentes/db.mjs"
const obtenerNombreCamaUI = async (camaIDV) => {
    try {
        const resolucionNombre = await conexion.query(`SELECT "camaUI" FROM camas WHERE cama = $1`, [camaIDV])
        if (resolucionNombre.rowCount === 0) {
            const error = "No existe el identificador de la camaIDV"
            throw new Error(error)
        }
        return resolucionNombre.rows[0].camaUI
    } catch (error) {
        throw error;
    }
}
export {
    obtenerNombreCamaUI
}