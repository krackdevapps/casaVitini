import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";

export const eliminarCuentasNoVerificadas = async () => {
    try {
        const fechaActual_ISO = DateTime.utc().toISO();
        const eliminarCuentasNoVefificadas = `
            DELETE FROM usuarios
            WHERE "fechaCaducidadCuentaNoVerificada" < $1 
            AND "rolIDV" <> $2
            AND "cuentaVerificadaIDV" <> $3;
            `;
        await conexion.query(eliminarCuentasNoVefificadas, [fechaActual_ISO, "administrador", "si"]);
    } catch (error) {
        throw error;
    }
}