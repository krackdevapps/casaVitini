import { conexion } from "../../../componentes/db.mjs"

export const actualizarEstadoDelInterruptor = async (data) => {
    try {

        const estado = data.estado
        const interruptorIDV = data.interruptorIDV

        const consulta = `
        UPDATE 
            "interruptoresGlobales"
        SET
            estado = $1
        WHERE
            "interruptorIDV" = $2
            RETURNING *;`;

        const parametros = [
            estado,
            interruptorIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se puede actualizar el interruptor por que existe ningun interruptor con ese interruptorIDV : " + interruptorIDV;
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
