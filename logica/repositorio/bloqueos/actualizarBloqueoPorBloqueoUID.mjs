import { conexion } from "../../componentes/db.mjs";

export const actualizarBloqueoPorBloqueoUID = async (data) => {
    try {
        const tipoBloqueo = data.tipoBloqueo
        const fechaInicio_ISO = data.fechaInicio_ISO
        const fechaFin_ISO = data.fechaFin_ISO
        const motivo = data.motivo
        const zona = data.zona
        const bloqueoUID = data.bloqueoUID

        const consulta = `
        UPDATE "bloqueosApartamentos"
        SET 
        "tipoBloqueo" = COALESCE($1, "tipoBloqueo"),
        entrada = COALESCE($2, entrada),
        salida = COALESCE($3, salida),
        motivo = COALESCE($4, motivo),
        zona = COALESCE($5, zona)
        WHERE uid = $6;
        `;
        const datosParaActualizar = [
            tipoBloqueo,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zona,
            bloqueoUID
        ];
        const resuelve = await conexion.query(consulta, [datosParaActualizar])
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el bloqueo con los nuevo datos.";
            throw new Error(error)            
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}