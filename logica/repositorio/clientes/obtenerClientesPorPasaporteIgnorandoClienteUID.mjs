import { conexion } from "../../componentes/db.mjs";
export const obtenerClientesPorPasaporteIgnorandoClienteUID = async (data) => {
    try {
        const pasaporte = data.pasaporte
        const clienteUID = data.clienteUID
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM 
        clientes
        WHERE 
        pasaporte = $1
        AND 
        "clienteUID" <> $2;`

        const parametros = [
            pasaporte,
            clienteUID
        ]

        const resuelve = await conexion.query(consulta, parametros)
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra ningun cliente distinto al clienteUID con ese pasaporte"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {

            if (resuelve.rowCount > 0) {
                const error = "Ya existe un cliente distinco a ese clienteUID con ese pasaporte"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerClientesPorPasaporteIgnorandoClienteUID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
