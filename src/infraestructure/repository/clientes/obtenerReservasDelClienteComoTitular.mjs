import { conexion } from "../globales/db.mjs";
export const obtenerReservasDelClienteComoTitular = async (clienteUID) => {
    try {
        const consulta = `
            SELECT 
            "reservaUID"
            FROM 
            "reservaTitulares" 
            WHERE 
            "clienteUID" = $1`;
        const resuelve = await conexion.query(consulta, [clienteUID]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
