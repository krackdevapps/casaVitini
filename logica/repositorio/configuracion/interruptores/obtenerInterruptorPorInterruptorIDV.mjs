import { conexion } from "../../../componentes/db.mjs"

export const obtenerInterruptorPorInterruptorIDV = async (interruptorIDV) => {
    try {
        const consulta = `
            SELECT 
                "interruptorIDV"
            FROM 
                "interruptoresGlobales"
            WHERE 
                "interruptorIDV" = $1;
           `;


        const resuelve = await conexion.query(consulta, [interruptorIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun interruptor con ese interruptorIDV : " + interruptorIDV;
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
