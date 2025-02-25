import { conexion } from "../globales/db.mjs";
export const insertarOferta = async (data) => {
    try {

        const nombreOferta = data.nombreOferta
        const entidadIDV = data.entidadIDV
        const fechaInicio = data.fechaInicio
        const fechaFinal = data.fechaFinal
        const condicionesArray = JSON.stringify(data.condicionesArray)
        const descuentosJSON = JSON.stringify(data.descuentosJSON)
        const estado = data.estado
        const zonaIDV = data.zonaIDV
        const testingVI = data.testingVI

        const consulta = `
            INSERT INTO "ofertas"
            (
                "nombreOferta",
                "entidadIDV",
                "fechaInicio",
                "fechaFinal",
                "condicionesArray",
                "descuentosJSON",
                "estadoIDV",
                "zonaIDV",
                "testingVI"
            )
            VALUES
            (
                COALESCE($1::text, NULL),
                COALESCE($2::text, NULL),
                COALESCE($3::date, NULL),
                COALESCE($4::date, NULL),
                NULLIF($5::jsonb, NULL),
                NULLIF($6::jsonb, NULL),
                COALESCE($7::"tipo_estadosIDV", NULL),
                COALESCE($8::"tipo_zonasIDV", NULL),
                COALESCE($9::text, NULL)


            )
            RETURNING *;
            `;

        const parametros = [
            nombreOferta,
            entidadIDV,
            fechaInicio,
            fechaFinal,
            condicionesArray,
            descuentosJSON,
            estado,
            zonaIDV,
            testingVI
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "Ha ocurrido un error y no se ha insertado la nueva oferta";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
