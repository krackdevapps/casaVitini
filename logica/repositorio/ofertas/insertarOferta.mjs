import { conexion } from "../../componentes/db.mjs";
export const insertarOferta = async (data) => {
    try {

        const nombreOferta = data.nombreOferta
        const fechaInicio = data.fechaInicio
        const fechaFinal = data.fechaFinal
        const condiciones = JSON.stringify(data.condiciones)
        const descuentos = JSON.stringify(data.descuentos)

        const consulta = `
            INSERT INTO "ofertas"
            (
                "nombreOferta",
                "fechaInicio",
                "fechaFinal",
                "condicionesArray",
                "descuentosArray"
            )
            VALUES
            (
                COALESCE($1::text, NULL),
                COALESCE($2::date, NULL),
                COALESCE($3::date, NULL),
                NULLIF($4::jsonb, NULL),
                NULLIF($5::jsonb, NULL)
    
            )
            RETURNING *;
            `;

            const parametros = [
                nombreOferta,
                fechaInicio,
                fechaFinal,
                condiciones,
                descuentos
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
