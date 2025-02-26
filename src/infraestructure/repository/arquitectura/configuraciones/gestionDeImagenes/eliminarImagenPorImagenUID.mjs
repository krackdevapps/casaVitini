import { conexion } from "../../../globales/db.mjs";

export const eliminarImagenPorImagenUID = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const imagenUID = data.imagenUID
        const consulta = `
        DELETE FROM "configuracionAlojamientoImagenes"
        WHERE
        "apartamentoIDV" = $1
        AND
        "imagenUID" = $2
        RETURNING 
        *
        ;`;

        const parametros = [
            apartamentoIDV,
            imagenUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}