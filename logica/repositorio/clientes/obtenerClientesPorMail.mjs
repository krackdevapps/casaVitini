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
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
