import { conexion } from "../../componentes/db.mjs";
const obtenerNombreApartamentoUI = async (apartamentoIDV) => {
    try {
        const consulta = `
        SELECT "apartamentoUI" 
        FROM apartamentos 
        WHERE apartamento = $1
        `
        const resolucionNombreApartamento = await conexion.query(consulta, [apartamentoIDV])
        return resolucionNombreApartamento.rows[0]?.apartamentoUI || "No encontrado"
    } catch (error) {
        throw error;
    }
}
export {
    obtenerNombreApartamentoUI
}