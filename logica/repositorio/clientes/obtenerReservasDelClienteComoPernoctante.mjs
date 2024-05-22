import { conexion } from "../../componentes/db.mjs";
export const obtenerReservasDelClienteComoPernoctante = async (clienteUID) => {
    try {
    
        const consulta =  `
        SELECT 
        *
        FROM 
        "reservaPernoctantes" 
        WHERE 
        "clienteUID" = $1`;
        const resuelve = await conexion.query(consulta, [clienteUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
