import { conexion } from "../../componentes/db.mjs";
export const obtenerOferatPorOfertaUID = async (ofertaUID) => {
    try {
        const consulta =  `
        SELECT
        "ofertaUID",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal", 
        "condicionesArray",
        "descuentosJSON",
        "estadoIDV",
        "zonaIDV",
        "entidadIDV",
        "nombreOferta"
        FROM
        ofertas
        WHERE
        "ofertaUID" = $1;
        `
        const resuelve = await conexion.query(consulta, [ofertaUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe la oferta, revisa el ofertaUID introducie en el campo ofertaUID, recuerda que debe de ser un number";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
