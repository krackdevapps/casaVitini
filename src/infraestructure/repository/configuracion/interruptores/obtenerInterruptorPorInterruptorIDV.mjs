import { conexion } from "../../globales/db.mjs"

export const obtenerInterruptorPorInterruptorIDV = async (interruptorIDV) => {
    try {
        const consulta = `
            SELECT 
                *
            FROM 
                "interruptoresGlobales"
            WHERE 
                "interruptorIDV" = $1;
           `;
        const resuelve = await conexion.query(consulta, [interruptorIDV]);
        if (resuelve.rowCount === 0) {
            const error = "¡No existe ningún interruptor con ese interruptorIDV: " + interruptorIDV;
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
