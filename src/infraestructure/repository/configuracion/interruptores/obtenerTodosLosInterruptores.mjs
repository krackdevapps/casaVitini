import { conexion } from "../../globales/db.mjs"

export const obtenerTodosLosInterruptores = async () => {
    try {
        const consulta = `
        SELECT 
            "estadoIDV",
            "interruptorIDV"
        FROM 
            "interruptoresGlobales";
       `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
