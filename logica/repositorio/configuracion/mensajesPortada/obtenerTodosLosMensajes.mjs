import { conexion } from "../../../componentes/db.mjs"

export const obtenerTodosLosMensjaes = async () => {
    try {
        const consulta = `
        SELECT 
            *
        FROM 
            "mensajesEnPortada";
       `;

        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
