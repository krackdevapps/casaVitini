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
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra ningun cliente con ese pasaporte"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
