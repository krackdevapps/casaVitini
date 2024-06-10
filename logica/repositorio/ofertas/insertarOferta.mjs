import { conexion } from "../../componentes/db.mjs";
export const insertarOferta = async (data) => {
    try {

        const nombreOferta = data.nombreOferta
        const entidad = data.entidad
        const fechaInicio = data.fechaInicio
        const fechaFinal = data.fechaFinal
        const condiciones = JSON.stringify(data.condiciones)
        const descuentos = JSON.stringify(data.descuentos)
        const estado = data.estado
        const zonaIDV = data.zonaIDV

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
            )
            VALUES
            (
                COALESCE($1::text, NULL),
                COALESCE($2::text, NULL),
                COALESCE($3::date, NULL),
                COALESCE($4::date, NULL),
                NULLIF($5::jsonb, NULL),
                NULLIF($6::jsonb, NULL),
                COALESCE($7::text, NULL)
                COALESCE($8::text, NULL)

            )
            RETURNING *;
            `;

        const parametros = [
            nombreOferta,
            entidad,
            fechaInicio,
            fechaFinal,
            condiciones,
            descuentos,
            estado,
            zonaIDV
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
