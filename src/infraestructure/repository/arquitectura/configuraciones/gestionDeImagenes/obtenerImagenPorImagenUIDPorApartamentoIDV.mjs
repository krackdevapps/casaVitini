import { conexion } from "../../../globales/db.mjs"

export const obtenerImagenPorImagenUIDPorApartamentoIDV = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const imagenUID = data.imagenUID
        const consulta = `
            SELECT
            *
            FROM
            "configuracionAlojamientoImagenes"
            WHERE
            "apartamentoIDV" = $1
            AND
            "imagenUID" = $2;
            `
        const parametros = [
            apartamentoIDV,
            imagenUID
        ]
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra ninguna imagen con ese imagenUID y apartamentoIDV pasados"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}