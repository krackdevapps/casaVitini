import { conexion } from "../../componentes/db.mjs";
export const obtenerClientePoolPorPernoctanteUID = async (pernoctantaUID) => {
    try {
        const consulta =  `
        SELECT 
        *
        FROM 
        "poolClientes" 
        WHERE
        "pernoctanteUID" = $1;`;
        const resuelve = await conexion.query(consulta, [pernoctantaUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún cliente pool con ese pernoctanteUID";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
