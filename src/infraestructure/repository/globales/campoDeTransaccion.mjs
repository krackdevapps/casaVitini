import { conexion } from "../globales/db.mjs";

export const campoDeTransaccion = async (operacion) => {
    try {
        if (operacion === "iniciar") {
            await conexion.query("BEGIN")
        } else if (operacion === "confirmar") {
            await conexion.query("COMMIT")
        } else if (operacion === "cancelar") {
            await conexion.query("ROLLBACK")
        } else {
            const msg = "El campo de transacción necesita un identificador de operación válido."
            throw new Error(msg)
        }
    } catch (errorCapturado) {
        await conexion.query("ROLLBACK")
        throw errorCapturado
    }
}