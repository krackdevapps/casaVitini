import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";

export const eliminarUsuarioPorRolPorEstadoVerificacion = async () => {
    try {
        const rolAdministrador = "administrador"
        const estadoVerificado = "si"
        const fechaActual_ISO = DateTime.utc().toISO();

        const eliminarCuentasNoVefificadas = `
            DELETE FROM usuarios
            WHERE "fechaCaducidadCuentaNoVerificada" < $1 
            AND "rolIDV" <> $2
            AND "cuentaVerificadaIDV" <> $3;
            `;
        const parametros = [
            fechaActual_ISO,
            rolAdministrador,
            estadoVerificado
        ]
        await conexion.query(eliminarCuentasNoVefificadas, parametros);
    } catch (errorCapturado) {
        throw error;
    }
}