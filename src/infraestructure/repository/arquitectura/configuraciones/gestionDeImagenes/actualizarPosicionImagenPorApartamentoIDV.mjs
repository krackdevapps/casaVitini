import { conexion } from "../../../globales/db.mjs";

export const actualizarPosicionImagenPorApartamentoIDV = async (data) => {
    try {
        const posicion = data.posicion
        const apartamentoIDV = data.apartamentoIDV
        const imagenUID = data.imagenUID
        
        const consulta = `
        UPDATE 
        "configuracionAlojamientoImagenes"
        SET
        posicion = $1
        WHERE
        "apartamentoIDV" = $2
        AND
        "imagenUID" = $3
        RETURNING 
        *;
        `;
        const parametros = [
            posicion,
            apartamentoIDV,
            imagenUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado la nueva posicion de la imagen en la configuración de alojamiento"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}