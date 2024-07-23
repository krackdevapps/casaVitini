import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";

export const desactivarCuenta = async (data) => {
    try {
        const usuario = data.usuario
        const cuentaVerificadaIDV = "no"

        const fechaActualUTC = DateTime.utc();
        const fechaCaducidadCuentaNoVerificada = fechaActualUTC.plus({
            minutes: 30,
        });
        const volverAVerificarCuenta = `
            UPDATE 
            usuarios
            SET 
            "cuentaVerificadaIDV" = $1,
            "fechaCaducidadCuentaNoVerificada" =$2
            WHERE 
            usuario = $3
            RETURNING *
            ;`;
        const usuraioActualizado = await conexion.query(volverAVerificarCuenta, [
            cuentaVerificadaIDV,
            fechaCaducidadCuentaNoVerificada,
            usuario,
        ]);
        if (usuraioActualizado.rowCount === 0) {
            const error = "No se ha podido actualizar el estao de verificacion de la cuenta de usuario por que no se encuentra el usuario."
            throw new Error(error)
        }
        return usuraioActualizado.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
