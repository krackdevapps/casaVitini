import { conexion } from "../../componentes/db.mjs";

export const eliminarClientePoolPorPernoctanteUID = async (pernoctanteUID) => {
    try {
        const consulta = `
        DELETE FROM 
        "poolClientes"
        WHERE 
        "pernoctanteUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [pernoctanteUID]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

