import { conexion } from "../globales/db.mjs";
export const eliminarClienteDelPool = async (pernoctanteUID) => {
    try {
        const consulta = `
        DELETE FROM "poolClientes"
        WHERE "pernoctanteUID" = $1;`;
        await conexion.query(consulta, pernoctanteUID)
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
