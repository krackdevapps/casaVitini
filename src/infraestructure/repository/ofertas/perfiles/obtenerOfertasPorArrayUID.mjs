import { conexion } from "../../globales/db.mjs";

export const obtenerOfertasPorArrayUID = async (ofertasUIDArray) => {
    try {
        const consulta1 = `
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
        const consulta = `
                SELECT 
            i."ofertaUID",
            i."nombreOferta",
            to_char(i."fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
            to_char(i."fechaFinal", 'YYYY-MM-DD') as "fechaFinal", 
            i."condicionesArray",
            i."descuentosJSON"
        FROM 
            unnest($1::int[]) AS u(ofertaUID)
        JOIN 
            ofertas i ON u.ofertaUID = i."ofertaUID";
        `
        const parametros = [
            ofertasUIDArray
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
