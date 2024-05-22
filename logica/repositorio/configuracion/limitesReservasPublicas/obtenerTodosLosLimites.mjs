import { conexion } from "../../../componentes/db.mjs"

export const obtenerTodosLosLimites = async () => {
    try {
        const consulta = `
        SELECT 
            estado,
            "interruptorIDV"
        FROM 
            "interruptoresGlobales";
       `;
        const resuelve = await conexion.query(consulta, []);
        if (resuelve.rowCount === 0) {
            const error = "No hay interruptores definidos";
            throw new Error(error);
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
