import { conexion } from "../../componentes/db.mjs";

export const obtenerCalendariosPorPlataformaIDV = async (plataformaIDV) => {
    try {
        const consulta =  `
        SELECT *
        FROM "calendariosSincronizados"
        WHERE "plataformaOrigenIDV" = $1
        `;
        const resuelve = await conexion.query(consulta, [plataformaIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}