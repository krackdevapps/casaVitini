import { conexion } from "../../../globales/db.mjs";

export const actualizarImagenPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const imagenUID = data.imagenUID
        const imagenBase64 = data.imagenBase64
        const consulta = `
        UPDATE 
        "configuracionAlojamientoImagenes"
        SET
        "imagenBase64" = $2
        WHERE
        "apartamentoIDV" = $1
        AND
        "imagenUID" = $3
        RETURNING 
        *;
        `;
        const parametros = [
            apartamentoIDV,
            imagenBase64,
            imagenUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado la nueva en la configuración de alojamiento"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}