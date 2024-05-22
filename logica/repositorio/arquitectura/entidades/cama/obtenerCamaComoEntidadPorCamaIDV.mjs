import { conexion } from "../../../../componentes/db.mjs"
export const obtenerCamaComoEntidadPorCamaIDV = async (camaIDV) => {
    try {
        const consulta =`
        SELECT *
        FROM camas 
        WHERE "camaIDV" = $1`
        const resolucionNombre = await conexion.query(consulta, [camaIDV])
        return resolucionNombre.rows[0]
    } catch (errorCapturado) {
        throw error;
    }
}
