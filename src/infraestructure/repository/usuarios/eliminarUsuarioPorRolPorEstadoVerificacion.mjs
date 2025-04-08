import { DateTime } from "luxon";
import { conexion } from "../globales/db.mjs";

export const eliminarUsuarioPorRolPorEstadoVerificacion = async () => {
    try {
        const estadoVerificado = "si"
        const fechaActual_ISO = DateTime.utc().toISO();

        const eliminarCuentasNoVefificadas = `
            DELETE FROM usuarios
            WHERE "fechaCaducidadCuentaNoVerificada" < $1 
            AND "cuentaVerificadaIDV" <> $2
              AND NOT EXISTS (
              SELECT 1
              FROM permisos."usuariosEnGrupos"
              WHERE permisos."usuariosEnGrupos".usuario = usuarios.usuario
            );
            `;
        const parametros = [
            fechaActual_ISO,
            estadoVerificado
        ]
        await conexion.query(eliminarCuentasNoVefificadas, parametros);
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}