import { conexion } from "../../../componentes/db.mjs";

export const obtenerOfertasPorArrayUID = async (ofertasUIDArray) => {
    try {
        const consulta = `
        SELECT 
        "ofertaUID",
        "nombreOferta",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal", 
        "condicionesArray",
        "descuentosJSON"
        FROM
        ofertas 
        WHERE                     
        "ofertaUID" = ANY($1) 
        ;`
        const parametros = [
            ofertasUIDArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
