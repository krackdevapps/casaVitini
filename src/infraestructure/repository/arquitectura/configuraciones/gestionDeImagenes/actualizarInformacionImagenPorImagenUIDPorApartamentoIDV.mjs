import { conexion } from "../../../globales/db.mjs";

export const actualizarInformacionImagenPorImagenUIDPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const imagenUID = data.imagenUID
        const titulo = data.titulo
        const descripcion = data.descripcion
        const consulta = `
        UPDATE 
        "configuracionAlojamientoImagenes"
        SET
        titulo = $1,
        descripcion = $2
        WHERE
        "apartamentoIDV" = $3
        AND
        "imagenUID" = $4
        RETURNING 
        *;
        `;
        const parametros = [
            titulo,
            descripcion,
            apartamentoIDV,
            imagenUID
            
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado la nueva informacion de la imagen del alojamiento"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}