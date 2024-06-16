import { conexion } from "../../componentes/db.mjs";
export const obtenerTodasLasOfertas = async () => {
    try {
        const consulta = `
        SELECT
        "nombreOferta",
        "ofertaUID",
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal",
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
