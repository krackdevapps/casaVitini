import { conexion } from "../../../globales/db.mjs"

export const obtenerTodasLasImagenesPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
            SELECT
            *
            FROM
            "configuracionAlojamientoImagenes"
            WHERE
            "apartamentoIDV" = $1;
            `
        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}