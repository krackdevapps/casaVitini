import { conexion } from "../../../globales/db.mjs"

export const obtenerNumeroDeTodasLasImagenesPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
            SELECT COUNT(*) as "totalImagenes"
            FROM
            "configuracionAlojamientoImagenes"
            WHERE
            "apartamentoIDV" = $1;
            `
        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}