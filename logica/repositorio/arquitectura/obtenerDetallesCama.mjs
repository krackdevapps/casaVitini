import { conexion } from "../../componentes/db.mjs"
const obtenerDetallesCama = async (camaIDV) => {
    try {
        const consulta =`
        SELECT *
        FROM camas 
        WHERE cama = $1`
        const resolucionNombre = await conexion.query(consulta, [camaIDV])
        return resolucionNombre.rows[0]
    } catch (error) {
        throw error;
    }
}
export {
    obtenerDetallesCama
}