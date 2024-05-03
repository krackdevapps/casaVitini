import { conexion } from "../../componentes/db.mjs";
const resolverApartamentoUI = async (apartamentoIDV) => {
    try {
        const resolucionNombreApartamento = await conexion.query(`SELECT "apartamentoUI" FROM apartamentos WHERE apartamento = $1`, [apartamentoIDV])
        return resolucionNombreApartamento.rows[0]?.apartamentoUI || "No encontrado"
    } catch (error) {
        throw error;
    }
}
export {
    resolverApartamentoUI
}