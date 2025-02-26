import { conexion } from "../../globales/db.mjs"

export const insertarInterruptor = async (data) => {
    try {
        const interruptorIDV = data.interruptorIDV
        const estadoIDV = data.estadoIDV

        const consulta = `
        INSERT INTO "interruptoresGlobales"
        (
        "interruptorIDV",
        "estadoIDV"
        )
        VALUES ($1, $2)
        RETURNING *`;
        const parametros = [
            interruptorIDV,
            estadoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el interruptor";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
