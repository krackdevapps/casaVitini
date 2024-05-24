import { conexion } from "../../componentes/db.mjs";
export const obtenerClientesPorMail = async (mail) => {
    try {
        const consulta =  `
        SELECT 
        *
        FROM 
        clientes
        WHERE
        mail = $1;`;
        const resuelve = await conexion.query(consulta, [mail])
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra ningun cliente con ese email"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
