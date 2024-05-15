import { conexion } from "../../componentes/db.mjs";
export const eliminarClienteDelPool = async (pernoctanteUID) => {
    try {
        const consulta = `
        DELETE FROM "poolClientes"
        WHERE "pernoctanteUID" = $1;`;
        await conexion.query(consulta, pernoctanteUID)
    } catch (error) {
        throw error
    }
}
