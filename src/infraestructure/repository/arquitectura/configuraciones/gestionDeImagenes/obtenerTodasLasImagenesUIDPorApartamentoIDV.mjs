import { conexion } from "../../../globales/db.mjs"

export const obtenerTodasLasImagenesUIDPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta = `
            SELECT
            "imagenUID",
            posicion,
            titulo,
            descripcion
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