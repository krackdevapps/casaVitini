import { conexion } from "../../../globales/db.mjs";

export const insertarImagenPorApartamentoIDV = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const imagenBase64 = data.imagenBase64

        const consulta = `
        INSERT INTO "configuracionAlojamientoImagenes"
        (
        "apartamentoIDV",
        "imagenBase64",
        posicion
        )
        VALUES 
        (
        $1,
        $2,
        (SELECT COUNT(*) FROM "configuracionAlojamientoImagenes" WHERE "apartamentoIDV" = $1) + 1
        )
        RETURNING 
        *
        `;
        const parametros = [
            apartamentoIDV,
            imagenBase64
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la nueva en la configuración de alojamiento"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}