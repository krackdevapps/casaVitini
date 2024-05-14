import { conexion } from "../../componentes/db.mjs";
export const obtenerTodosAplicacionSobreIDV = async () => {
    try {
        const consulta =`
        SELECT
        "aplicacionIDV", "aplicacionUI"
        FROM 
        "ofertasAplicacion";`;
        const resuelve = await conexion.query(consulta)
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
