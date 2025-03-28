import { conexion } from "../../../globales/db.mjs"

export const obtenerImagenenPorUID = async (imagenUID) => {
    try {
        const consulta = `
            SELECT
            *
            FROM
            "configuracionAlojamientoImagenes"
            WHERE
            "imagenUID" = $1;
            `
        const resuelve = await conexion.query(consulta, [imagenUID])
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}