import { conexion } from "../../globales/db.mjs"

export const obtenerInterruptorPorInterruptorIDV = async (interruptorIDV) => {
    try {
        const consulta = `
            SELECT 
                *
            FROM 
                "interruptoresGlobales"
            WHERE 
                "interruptorIDV" = $1
                ;
           `;
        const resuelve = await conexion.query(consulta, [interruptorIDV]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
