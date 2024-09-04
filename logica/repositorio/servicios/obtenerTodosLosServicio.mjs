import { conexion } from "../../componentes/db.mjs";
export const obtenerTodosLosServicio = async () => {
    try {
        const consulta = `
        SELECT 
        *
        FROM 
        servicios`;
        const resuelve = await conexion.query(consulta)
        return resuelve.rows

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
