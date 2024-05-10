import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";

export const actualizarDatos = async (data) => {

    const usuarioIDX = data.usuarioIDX
    const email = data.email
    const nombre = data.nombre
    const primerApellido = data.primerApellido
    const segundoApellido = data.segundoApellido
    const pasaporte = data.pasaporte
    const telefono = data.telefono

    try {
        const controlNuevoCorreoPorVerifical = `
            SELECT 
            email
            FROM 
            "datosDeUsuario" 
            WHERE 
            "usuarioIDX" = $1 
            AND
            email = $2`;
        const resuelveNuevoCorreoPorVerifical = await conexion.query(
            controlNuevoCorreoPorVerifical,
            [usuarioIDX, email]
        );
        const actualizarDatosUsuario = `
            UPDATE "datosDeUsuario"
            SET
              "nombre" = COALESCE(NULLIF($1, ''), "nombre"),
              "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
              "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
              "pasaporte" = COALESCE(NULLIF($4, ''), "pasaporte"),
              "telefono" = COALESCE(NULLIF($5, ''), "telefono"),
              "email" = COALESCE(NULLIF($6, ''), "email")
            WHERE "usuarioIDX" = $7
            RETURNING
              "nombre",
              "primerApellido",
              "segundoApellido",
              "pasaporte",
              "telefono",
              "email";
            `;
        const datos = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            email,
            usuarioIDX,
        ];
        await conexion.query(
            actualizarDatosUsuario,
            datos
        );
        if (resuelveNuevoCorreoPorVerifical.rowCount === 0 && email.length > 0) {
            const fechaActualUTC = DateTime.utc();
            const fechaCaducidadCuentaNoVerificada = fechaActualUTC.plus({
                minutes: 30,
            });

            const volverAVerificarCuenta = `
            UPDATE 
            usuarios
            SET 
            "cuentaVerificada" = $1,
            "fechaCaducidadCuentaNoVerificada" =$2
            WHERE 
            usuario = $3;`;
            await conexion.query(volverAVerificarCuenta, [
                "no",
                fechaCaducidadCuentaNoVerificada,
                usuarioIDX,
            ]);
        }
    } catch (error) {
        throw error;
    }
};
