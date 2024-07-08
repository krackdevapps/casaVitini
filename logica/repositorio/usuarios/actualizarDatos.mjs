import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";

export const actualizarDatos = async (data) => {


    const usuario = data.usuario

    const mail = data.mail
    const nombre = data.nombre
    const primerApellido = data.primerApellido
    const segundoApellido = data.segundoApellido
    const pasaporte = data.pasaporte
    const telefono = data.telefono
    const cuentaVerificada = "no"

    try {

        const controlNuevoCorreoPorVerifical = `
            SELECT 
            mail
            FROM 
            "datosDeUsuario" 
            WHERE 
            usuario <> $1 
            AND
            mail = $2`;
        const resuelveNuevoCorreoPorVerifical = await conexion.query(
            controlNuevoCorreoPorVerifical,
            [usuario, mail]
        );
        if (resuelveNuevoCorreoPorVerifical.rowCount > 0) {
            //const cuentaConCorreoAsociado = resuelveNuevoCorreoPorVerifical.rows[0].usuario
            const error = "El correo electronico ya tiene un VitiniIDX asociado. Utiliza esa cuenta, recuperala o inserta otro correo electronico para esta cuenta."
            throw new Error(error)
        }

        const actualizarDatosUsuario = `
            UPDATE "datosDeUsuario"
            SET
              "nombre" = COALESCE(NULLIF($1, ''), "nombre"),
              "primerApellido" = COALESCE(NULLIF($2, ''), "primerApellido"),
              "segundoApellido" = COALESCE(NULLIF($3, ''), "segundoApellido"),
              "pasaporte" = COALESCE(NULLIF($4, ''), "pasaporte"),
              "telefono" = COALESCE(NULLIF($5, ''), "telefono"),
              "mail" = COALESCE(NULLIF($6, ''), "mail")
            WHERE usuario = $7
            RETURNING
              "nombre",
              "primerApellido",
              "segundoApellido",
              "pasaporte",
              "telefono",
              "mail";
            `;
        const datos = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            mail,
            usuario
        ]

        const datosActualuizzados = await conexion.query(
            actualizarDatosUsuario,
            datos
        );

        if (datosActualuizzados.rowCount === 0) {
            const error = "No se han actualizado los datos de usuario"
            throw new Error(error)
        }
        if (resuelveNuevoCorreoPorVerifical.rowCount === 0 && mail.length > 0) {
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
                cuentaVerificada,
                fechaCaducidadCuentaNoVerificada,
                usuario,
            ]);
            if (usuraioActualizado.rowCount === 0) {
                const error = "No se ha podido actualizar el estao de verificacion de la cuenta de usuario por que no se encuentra el usuario."
                throw new Error(error)
            }
            return datosActualuizzados.rows[0]
        }
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
