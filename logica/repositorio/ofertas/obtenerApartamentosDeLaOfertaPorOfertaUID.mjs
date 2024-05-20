import { conexion } from "../../componentes/db.mjs";
export const obtenerApartamentosDeLaOfertaPorOfertaUID = async (ofertaUID) => {
    try {
        const consulta =  `
        SELECT  
            "apartamentoIDV",
            "tipoDescuentoIDV",
             cantidad
        FROM 
            "ofertasApartamentos"
        WHERE
            "ofertaUID" = $1;
        `
        const resuelve = await conexion.query(consulta, [ofertaUID])
        return resuelve.rows
    } catch (error) {
        throw error
    }
}
