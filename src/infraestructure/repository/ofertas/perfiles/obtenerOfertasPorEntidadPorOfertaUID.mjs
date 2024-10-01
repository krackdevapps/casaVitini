import { conexion } from "../../globales/db.mjs";

export const obtenerOfertasPorEntidadPorOfertaUID = async (data) => {
    try {

        const ofertaUID = data.ofertaUID
        const entidadIDV = data.entidadIDV
        const consulta = `
        SELECT 
        "ofertaUID",
        "nombreOferta",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFinal", 'YYYY-MM-DD') as "fechaFinal", 
        "condicionesArray",
        "descuentosJSON",
        "estadoIDV",
        "zonaIDV",
        "entidadIDV"
        FROM
        ofertas 
        WHERE                     
        "ofertaUID" = $1
        AND
        "entidadIDV" = $2
        ;`

        const parametros = [
            ofertaUID,
            entidadIDV
        ]
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra ninguna oferta con esa entidadIDV y ofertaIDV"
            throw new Error(error)

        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
