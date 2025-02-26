import { conexion } from "../globales/db.mjs";

export const obtenerCalendariosPorPlataformaIDVPorApartamentoIDV = async (data) => {
    try {
        const plataformaIDV = data.plataformaIDV
        const apartamentoIDV = data.apartamentoIDV
        const consulta = `
        SELECT
        *
        FROM
        "calendariosSincronizados"
        WHERE
        "plataformaOrigenIDV" = $1
        AND
        "apartamentoIDV" = $2
        `;
        const parametros = [
            plataformaIDV,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}