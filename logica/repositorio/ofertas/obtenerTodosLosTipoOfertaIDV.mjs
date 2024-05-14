import { conexion } from "../../componentes/db.mjs";
export const obtenerTodosLosTipoOfertaIDV = async () => {
    try {
        const consulta =`
        SELECT
        "tipoOfertaIDV", "tipoOfertaUI"
        FROM 
        "ofertasTipo";`;
        const resuelve = await conexion.query(consulta)
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
