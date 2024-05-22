import { conexion } from "../../componentes/db.mjs";
export const obtenerClientesPorPasaporte = async (pasaporte) => {
    try {
        const consulta =  `
        SELECT 
        *
        FROM 
        clientes
        WHERE 
        pasaporte = $1;`
        const resuelve = await conexion.query(consulta, [pasaporte])
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
