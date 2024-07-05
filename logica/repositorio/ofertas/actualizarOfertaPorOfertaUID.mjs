import { conexion } from "../../componentes/db.mjs";
export const actualizarOfertaPorOfertaUID = async (data) => {
    try {
        const nombreOferta = data.nombreOferta
        const entidadIDV = data.entidadIDV
        const fechaInicio = data.fechaInicio
        const fechaFinal = data.fechaFinal
        const condicionesArray = JSON.stringify(data.condicionesArray)
        const descuentosJSON = JSON.stringify(data.descuentosJSON)
        const zonaIDV = data.zonaIDV
        const ofertaUID = data.ofertaUID

        const consulta = `
        UPDATE ofertas
        SET
        "nombreOferta" = COALESCE($1, NULL),
        "entidadIDV" = COALESCE($2, NULL),
        "fechaInicio" = COALESCE($3::date, NULL),
        "fechaFinal" = COALESCE($4::date, NULL),
        "condicionesArray" = COALESCE($5::jsonb, NULL),
        "descuentosJSON" = COALESCE($6::jsonb, NULL),
        "zonaIDV" = COALESCE($7::text, NULL)
        WHERE
        "ofertaUID" = $8
        RETURNING
        "ofertaUID",
        "nombreOferta",
        "entidadIDV",
        TO_CHAR("fechaInicio", 'YYYY-MM-DD') AS "fechaInicio",
        TO_CHAR("fechaFinal", 'YYYY-MM-DD') AS "fechaFinal",
        "condicionesArray",
        "descuentosJSON",
        "zonaIDV";`;
        const parametros = [
            nombreOferta,
            entidadIDV,
            fechaInicio,
            fechaFinal,
            condicionesArray,
            descuentosJSON,
            zonaIDV,
            ofertaUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar la oferta";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
