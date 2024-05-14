import { conexion } from "../../componentes/db.mjs";
export const obtenerApartamentosDeLaOfertaPorOfertaUID = async (ofertaUID) => {
    try {
        const consulta = `
        SELECT
        oa.apartamento AS "apartamentoIDV",
        a."apartamentoUI",
        oa."tipoDescuento",
        oa."cantidad"
        FROM 
        "ofertasApartamentos" oa
        LEFT JOIN
        "apartamentos" a ON oa.apartamento = a.apartamento
        WHERE oferta = $1
        `
        const resuelve = await conexion.query(consulta, [ofertaUID])
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
