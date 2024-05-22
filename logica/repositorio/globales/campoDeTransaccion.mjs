import { conexion } from "../../componentes/db.mjs";

export const campoDeTransaccion = async (operacion) => {
    try {
        if (operacion === "iniciar") {
            await conexion.query("BEGIN")
        } else if (operacion === "confirmar") {
            await conexion.query("COMMIT")
        } else if (operacion === "cancelar") {
            await conexion.query("ROLLBACK")
        } else {
            const msg = "El campo de transaccion necesita un identificador de operacion valida"
            throw new error(msg)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}