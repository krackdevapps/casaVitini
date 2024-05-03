import { conexion } from '../../db.mjs';
const interruptor = async (interruptorIDV) => {
    try {
        const consultaConfiguracionGlobal = `
            SELECT 
                estado,
                "interruptorIDV"
            FROM 
                "interruptoresGlobales"
            WHERE
                "interruptorIDV" = $1;`;
        const resuelveEstado = await conexion.query(consultaConfiguracionGlobal, [interruptorIDV])
        if (resuelveEstado.rowCount === 0) {
            const error = "El controlador del interruptor no ha encontrado el interruptor, verifica el interruptorIDV"
            throw new Error(error)
        }
        const estadoInterruptor = resuelveEstado.rows[0].estado
        if (estadoInterruptor === "activado") {
            return true
        } else {
            return false
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
export {
    interruptor
}