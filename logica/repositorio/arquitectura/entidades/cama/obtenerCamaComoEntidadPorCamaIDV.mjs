import { conexion } from "../../../../componentes/db.mjs"
export const obtenerCamaComoEntidadPorCamaIDV = async (camaIDV) => {
    try {
        const consulta =`
        SELECT *
        FROM camas 
        WHERE "camaIDV" = $1`
        const resuelve = await conexion.query(consulta, [camaIDV])
        if (resuelve.rowCount === 0) {
            const error = "No se encuntra ninguna cama con ese camaIDV"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw error;
    }
}
