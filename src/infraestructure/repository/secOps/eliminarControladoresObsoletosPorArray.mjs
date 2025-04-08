import { conexion } from "../globales/db.mjs";

export const eliminarControladoresObsoletosPorArray = async (data) => {
    try {
        const rutasControladoresObsoletas = data.rutasControladoresObsoletas

        const consulta = `
        DELETE FROM
        permisos.controladores
        WHERE
        "controladorIDV" = ANY($1::text[]);
        `;
        const c = await conexion.query(consulta, [rutasControladoresObsoletas]);
        return c.rows[0]

    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}