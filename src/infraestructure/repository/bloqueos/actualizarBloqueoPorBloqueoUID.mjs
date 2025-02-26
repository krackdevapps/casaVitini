import { conexion } from "../globales/db.mjs";

export const actualizarBloqueoPorBloqueoUID = async (data) => {
    try {
        const tipoBloqueoIDV = data.tipoBloqueoIDV
        const fechaInicio_ISO = data.fechaInicio_ISO
        const fechaFin_ISO = data.fechaFin_ISO
        const motivo = data.motivo
        const zonaIDV = data.zonaIDV
        const bloqueoUID = data.bloqueoUID

        const consulta = `
        UPDATE
        "bloqueosApartamentos"
        SET 
        "tipoBloqueoIDV" = $1,
        "fechaInicio" = $2,
        "fechaFin" = $3,
        motivo = $4,
        "zonaIDV" = $5
        WHERE 
        "bloqueoUID" = $6
        RETURNING
        "tipoBloqueoIDV",
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio", 
        to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin",
        motivo,
        "zonaIDV"
        
        `;
        const datosParaActualizar = [
            tipoBloqueoIDV,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zonaIDV,
            bloqueoUID
        ];


        const resuelve = await conexion.query(consulta, datosParaActualizar)
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el bloqueo con los nuevos datos.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}