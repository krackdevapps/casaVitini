import { conexion } from "../globales/db.mjs";
export const obtenerClientesPorMail = async (data) => {
    try {

        const mail = data.mail
        const errorSi = data.errorSi
        const consulta = `
        SELECT 
        *
        FROM 
        clientes
        WHERE
        mail = $1;`;
        const resuelve = await conexion.query(consulta, [mail])
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se encuentra ningún apartamento como entidad con ese apartamentoIDV"
                throw new Error(error)
            }
            return resuelve.rows

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya existe un apartamento como entidad con ese apartamentoIDV"
                throw new Error(error)
            }
            return resuelve.rows

        } else if (errorSi === "desactivado") {
            return resuelve.rows
        } else {
            const error = "El adaptador obtenerClientesPorMail necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
