import { conexion } from "../globales/db.mjs";
export const obtenerTodasLasOfertas = async () => {
    try {
        const consulta = `
        SELECT
        "nombreOferta",
        "ofertaUID",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal",
        "condicionesArray",
        "descuentosJSON",
        "estadoIDV",
        "zonaIDV",
        "entidadIDV"
        FROM 
        ofertas 
        ORDER BY 
        "fechaInicio" ASC;
        `;
        const resuelve = await conexion.query(consulta)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
