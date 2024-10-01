import { conexion } from "../globales/db.mjs";

export const obtenerImpuestosPorEntidadIDV = async (data) => {
    try {
        const entidadIDV = data.entidadIDV
        const estadoIDV = data.estadoIDV
        const consulta = `
        SELECT
        *
        FROM
        impuestos
        WHERE
        "entidadIDV" = $1
        AND
        "estadoIDV" = $2;
        `;
        const parametros = [
            entidadIDV,
            estadoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}