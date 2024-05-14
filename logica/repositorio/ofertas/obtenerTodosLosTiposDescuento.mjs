import { conexion } from "../../componentes/db.mjs";
export const obtenerTodosLosTiposDescuento = async () => {
    try {
        const consulta =`
        SELECT
        "tipoDescuentoIDV", "tipoDescuentoUI"
        FROM 
        "ofertasTipoDescuento";`;
        const resuelve = await conexion.query(consulta)
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
