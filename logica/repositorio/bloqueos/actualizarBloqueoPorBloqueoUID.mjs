import { conexion } from "../../componentes/db.mjs";

export const actualizarBloqueoPorBloqueoUID = async (data) => {
    try {
        const tipoBloqueo = data.tipoBloqueo
        const fechaInicio_ISO = data.fechaInicio_ISO
        const fechaFin_ISO = data.fechaFin_ISO
        const motivo = data.motivo
        const zonaIDV = data.zonaIDV
        const bloqueoUID = data.bloqueoUID

        const consulta = `
        UPDATE
        "bloqueosApartamentos"
        SET 
        "tipoBloqueoIDV" = COALESCE($1, "tipoBloqueoIDV"),
        "fechaInicio" = COALESCE($2, "fechaInicio"),
        "fechaFin" = COALESCE($3, "fechaFin"),
        motivo = COALESCE($4, motivo),
        "zonaIDV" = COALESCE($5, "zonaIDV")
        WHERE 
        "bloqueoUID" = $6
        RETURNING 
        *
        `;
        const datosParaActualizar = [
            tipoBloqueo,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zonaIDV,
            bloqueoUID
        ];
        const resuelve = await conexion.query(consulta, datosParaActualizar)
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el bloqueo con los nuevo datos.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}