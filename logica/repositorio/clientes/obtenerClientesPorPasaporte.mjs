import { conexion } from "../../componentes/db.mjs";
export const obtenerClientesPorPasaporte = async (data) => {
    try {
        const pasaporte = data.pasaporte
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM 
        clientes
        WHERE 
        pasaporte = $1;`
        const resuelve = await conexion.query(consulta, [pasaporte])
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra ningun cliente con ese pasaporte"
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un cliente con ese pasaporte"
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows[0]
        } else {
            const error = "el adaptador obtenerClientesPorPasaporte necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
